import React, { useMemo, useState, useEffect } from 'react';
import { 
  UserCheck, 
  Wallet, 
  Plus, 
  CircleMinus, 
  User as UserIcon, 
  Camera, 
  LayoutGrid, 
  Lock, 
  Palette, 
  ShieldCheck, 
  Monitor, 
  Sparkles, 
  Mail, 
  Phone, 
  Key, 
  ShieldAlert,
  Zap,
  Check,
  Trophy,
  Award,
  Flame,
  Swords,
  Shield,
  Bot,
  History,
  TrendingUp,
  FileText,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock
} from 'lucide-react';
import { PlayerProfile, AnimeTheme, ShopItem } from './types.ts';
import { SectionLoader } from './components.tsx';
import { SHOP_ITEMS } from './mockData.ts';
import { api } from './apiClient.ts';

interface ProfilePanelProps {
  profile: PlayerProfile;
  setProfile: (p: PlayerProfile) => void;
  editFields: any;
  setEditFields: (f: any) => void;
  profileTab: 'identity' | 'progression' | 'account' | 'style' | 'wallet' | 'armory';
  setProfileTab: (t: any) => void;
  isUpdatingProfile: boolean;
  handleSaveProfile: () => void;
  onAvatarClick: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  activeTheme: AnimeTheme;
  setTheme: (t: AnimeTheme) => void;
}

export const getDecorationClass = (id?: string) => {
  if (id === 'd1') return 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] ring-2 ring-cyan-400/20';
  if (id === 'd2') return 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.7)] ring-2 ring-yellow-400/30';
  return 'border-primary/20';
};

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  profile, setProfile, editFields, setEditFields, profileTab, setProfileTab,
  isUpdatingProfile, handleSaveProfile, onAvatarClick, onDeposit, onWithdraw,
  activeTheme, setTheme
}) => {
  const [progression, setProgression] = useState<any>(null);
  const [isLoadingProgression, setIsLoadingProgression] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pvp' | 'bot'>('all');
  
  const ownedItems = SHOP_ITEMS.filter(item => profile.ownedItems.includes(item.id));

  // Fetch verified progression data from server
  useEffect(() => {
    let isMounted = true;
    setIsLoadingProgression(true);
    api.getMyProgression()
      .then((data) => {
        if (isMounted && data) {
          setProgression(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingProgression(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile.exp, profile.rank, profileTab]);
  
  const toggleActivation = (itemId: string, type: string) => {
    setProfile({
      ...profile,
      [type === 'plugin' ? 'activePlugin' : 'activeDecoration']: 
        profile[type === 'plugin' ? 'activePlugin' : 'activeDecoration'] === itemId ? undefined : itemId
    });
  };

  const THEME_OPTIONS: { id: AnimeTheme; label: string; color: string; shopId?: string }[] = useMemo(() => [
    { id: 'mha', label: 'Plus Ultra (MHA)', color: 'bg-violet-600' },
    { id: 'onepiece', label: 'Grand Line', color: 'bg-cyan-600', shopId: 't1' },
    { id: 'naruto', label: 'Hidden Leaf', color: 'bg-orange-600', shopId: 't2' },
    { id: 'violet-rift', label: 'Violet Rift', color: 'bg-violet-500', shopId: 't3' },
    { id: 'cyberwave', label: 'Cyberwave', color: 'bg-cyan-500', shopId: 't4' },
    { id: 'arctic-pulse', label: 'Arctic Pulse', color: 'bg-sky-400', shopId: 't5' },
    { id: 'emberstorm', label: 'Emberstorm', color: 'bg-orange-500', shopId: 't6' },
    { id: 'sakura-bloom', label: 'Sakura Bloom', color: 'bg-pink-500', shopId: 't7' },
  ], []);

  const isThemeOwned = (shopId?: string) => {
    if (!shopId) return true; // Base themes are free
    return profile.ownedItems.includes(shopId);
  };

  const currentLevel = progression?.level || profile.rank || 1;
  const currentTier = progression?.tier || { name: 'BRONZE', title: 'Bronze Contender', color: '#cd7f32' };
  const expInLevel = progression?.expInLevel ?? (profile.exp % 300);
  const expForNextLevel = progression?.expForNextLevel ?? 300;
  const progressPercent = progression?.progressPercent ?? Math.min(100, Math.round((expInLevel / expForNextLevel) * 100));

  const filteredHistory = useMemo(() => {
    const list = progression?.recentHistory || [];
    if (historyFilter === 'pvp') return list.filter((m: any) => !m.isBotMatch);
    if (historyFilter === 'bot') return list.filter((m: any) => m.isBotMatch);
    return list;
  }, [progression?.recentHistory, historyFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300 pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">User HQ</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Manage your profile and career progression</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scrollbar-hide">
          {(['identity', 'progression', 'account', 'style', 'armory', 'wallet'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setProfileTab(tab)} 
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${profileTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              {tab === 'progression' ? 'Career & XP' : tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] border-2 border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><LayoutGrid size={120} /></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className={`w-36 h-36 rounded-full border-4 p-1.5 transition-all duration-500 overflow-hidden ${getDecorationClass(profile.activeDecoration)}`}>
                  <img src={profile.avatar} className="w-full h-full rounded-full object-cover" alt="Preview" />
                </div>
                <button onClick={onAvatarClick} className="absolute bottom-1 right-1 p-3 bg-primary text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-10"><Camera size={18} /></button>
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">{profile.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span 
                  className="font-black uppercase tracking-widest text-[9px] px-2.5 py-0.5 rounded border"
                  style={{ color: currentTier.color, borderColor: `${currentTier.color}40`, backgroundColor: `${currentTier.color}15` }}
                >
                  {currentTier.name} • LEVEL {currentLevel}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">{profile.team || 'Ronin (No Team)'}</span>
              </div>
              
              <div className="w-full h-px bg-white/5 my-8" />
              
              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">EXP Progress</span>
                    <span className="text-white font-mono">{expInLevel} / {expForNextLevel} XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full shadow-[0_0_15px_var(--primary)] transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 font-black uppercase">
                    <span>{progressPercent}% to Level {currentLevel + 1}</span>
                    <span>Total {progression?.totalExp || profile.exp} XP</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[8px] font-black text-gray-500 uppercase">Rank Tier Status</p>
                    <span className="text-[9px] font-black uppercase" style={{ color: currentTier.color }}>
                      {currentTier.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.activePlugin && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[8px] font-black rounded border border-purple-500/20 uppercase flex items-center gap-1"><Monitor size={10}/> Plugin On</span>}
                    {profile.activeDecoration && (
                      <span className={`px-2 py-1 text-[8px] font-black rounded border uppercase flex items-center gap-1 ${
                        profile.activeDecoration === 'd1' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                      }`}>
                        <Sparkles size={10}/> {profile.activeDecoration === 'd1' ? 'Plasma' : 'Aura'} On
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          {isUpdatingProfile ? <SectionLoader message="Syncing with Servers..." /> : (
            <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border border-white/10 min-h-[550px]">
              
              {profileTab === 'identity' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3"><UserCheck className="text-primary" /> Identity Hub</h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2">Username <Lock size={10} className="text-red-500" /></label>
                      <div className="relative">
                        <input type="text" value={profile.name} disabled className="w-full bg-white/5 border border-red-500/20 rounded-2xl py-5 px-6 text-sm font-black text-gray-500 cursor-not-allowed opacity-60" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-500 uppercase tracking-widest">PERMANENT</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2"><Mail size={10} /> Email Registry</label>
                      <input type="email" value={editFields.email} onChange={(e) => setEditFields({...editFields, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2"><Phone size={10} /> Comm Channel (Phone)</label>
                      <input type="text" value={editFields.phone} onChange={(e) => setEditFields({...editFields, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2">Birth Record <Lock size={10} className="text-red-500" /></label>
                      <div className="relative">
                        <input type="date" value={profile.birthday} disabled className="w-full bg-white/5 border border-red-500/20 rounded-2xl py-5 px-6 text-sm font-black text-gray-500 cursor-not-allowed opacity-60 uppercase" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-500 uppercase tracking-widest">PERMANENT</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Manifesto (Bio)</label>
                    <textarea rows={5} value={editFields.bio} onChange={(e) => setEditFields({...editFields, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" placeholder="Transmit your mission statement to the global arena..." />
                  </div>
                </div>
              )}

              {/* Career Progression & Verified Match History Tab */}
              {profileTab === 'progression' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Trophy className="text-yellow-400" /> Career & Progression
                      </h4>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                        Server-authoritative records, XP progression, and auditable match history
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-gray-500">Tier:</span>
                      <span 
                        className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest border"
                        style={{ color: currentTier.color, borderColor: `${currentTier.color}40`, backgroundColor: `${currentTier.color}15` }}
                      >
                        {currentTier.name} (LVL {currentLevel})
                      </span>
                    </div>
                  </div>

                  {/* Level & XP Progress Hero Banner */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white/[0.07] via-white/[0.03] to-transparent border border-white/10 space-y-4 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                          Level Progression
                        </span>
                        <h5 className="text-3xl font-black text-white tracking-tight uppercase mt-0.5">
                          Level {currentLevel} • <span style={{ color: currentTier.color }}>{currentTier.title}</span>
                        </h5>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-black uppercase text-gray-500 block">Total Career EXP</span>
                        <span className="text-2xl font-black text-cyan-400 font-mono">
                          {(progression?.totalExp || profile.exp).toLocaleString()} XP
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-cyan-400 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <span>{expInLevel} / {expForNextLevel} XP In Current Level</span>
                        <span className="text-yellow-400">{expForNextLevel - expInLevel} XP to Level {currentLevel + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distinct Statistics: Human Online PvP vs AI Bot Simulation */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <TrendingUp size={14} /> Distinct Combat Performance
                    </h5>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Human Online PvP Record */}
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                            <Swords size={16} /> Human Online PvP
                          </span>
                          <span className="text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                            Win Rate: {progression?.stats?.pvp?.winRate ?? 0}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block">Wins</span>
                            <span className="text-xl font-black text-green-400 font-mono">
                              {progression?.stats?.pvp?.wins ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block">Losses</span>
                            <span className="text-xl font-black text-red-400 font-mono">
                              {progression?.stats?.pvp?.losses ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block">Draws</span>
                            <span className="text-xl font-black text-yellow-400 font-mono">
                              {progression?.stats?.pvp?.draws ?? 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 pt-1">
                          <span>Matches Played: {progression?.stats?.pvp?.played ?? 0}</span>
                          <span>Streak: {progression?.stats?.pvp?.currentStreak ?? 0} (Max: {progression?.stats?.pvp?.highestStreak ?? 0})</span>
                        </div>
                      </div>

                      {/* AI Bot Simulation Practice Record */}
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Bot size={16} /> AI Bot Practice
                          </span>
                          <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                            Win Rate: {progression?.stats?.bot?.winRate ?? 0}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block">Wins</span>
                            <span className="text-xl font-black text-green-400 font-mono">
                              {progression?.stats?.bot?.wins ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block">Losses</span>
                            <span className="text-xl font-black text-red-400 font-mono">
                              {progression?.stats?.bot?.losses ?? 0}
                            </span>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block">Draws</span>
                            <span className="text-xl font-black text-yellow-400 font-mono">
                              {progression?.stats?.bot?.draws ?? 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 pt-1">
                          <span>Practice Sessions: {progression?.stats?.bot?.played ?? 0}</span>
                          <span>Bots Neutralized: {progression?.stats?.totalEliminations ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filterable Match History Table */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <History size={14} /> Match History ({filteredHistory.length})
                      </h5>
                      <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-wider">
                        <button
                          onClick={() => setHistoryFilter('all')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${historyFilter === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          All Matches
                        </button>
                        <button
                          onClick={() => setHistoryFilter('pvp')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${historyFilter === 'pvp' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          Human PvP
                        </button>
                        <button
                          onClick={() => setHistoryFilter('bot')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${historyFilter === 'bot' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          Bot Practice
                        </button>
                      </div>
                    </div>

                    {filteredHistory.length === 0 ? (
                      <div className="p-12 text-center glass-panel rounded-3xl border-dashed border-white/10 space-y-3">
                        <History size={32} className="mx-auto text-gray-600 opacity-60" />
                        <p className="text-sm font-bold text-gray-400 uppercase">No recorded matches found</p>
                        <p className="text-[10px] text-gray-600 uppercase font-black">
                          Complete an Encarto Arena match to begin earning XP and ranking up!
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                              <th className="py-3 px-4">Game & Opponent</th>
                              <th className="py-3 px-4">Mode</th>
                              <th className="py-3 px-4">Outcome</th>
                              <th className="py-3 px-4">Score</th>
                              <th className="py-3 px-4 text-right">XP Earned</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredHistory.map((item: any) => (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 px-4 font-bold text-white">
                                  <div className="flex items-center gap-2">
                                    <span className="uppercase">{item.gameType}</span>
                                    <span className="text-gray-600 font-normal">vs</span>
                                    <span className="text-gray-300 font-mono text-[11px]">{item.opponentName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {item.isBotMatch ? (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      BOT ({item.botDifficulty || 'SIM'})
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                      ONLINE PVP
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                    item.outcome === 'VICTORY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    item.outcome === 'DEFEAT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    item.outcome === 'FORFEIT' ? 'bg-red-600/20 text-red-500 border border-red-600/30' :
                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  }`}>
                                    {item.outcome === 'VICTORY' && <CheckCircle2 size={10} />}
                                    {item.outcome === 'DEFEAT' && <XCircle size={10} />}
                                    {item.outcome === 'DRAW' && <MinusCircle size={10} />}
                                    {item.outcome}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-gray-300">
                                  {item.playerScore} <span className="text-gray-600">vs</span> {item.opponentScore}
                                </td>
                                <td className="py-3 px-4 text-right font-black font-mono text-cyan-400">
                                  +{item.xpEarned} XP
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Auditable XP Transactions Ledger */}
                  {progression?.recentTransactions && progression.recentTransactions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h5 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <FileText size={14} /> Auditable XP Ledger ({progression.recentTransactions.length})
                      </h5>
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                              <th className="py-3 px-4">Transaction ID</th>
                              <th className="py-3 px-4">Reason / Rule</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Level Progression</th>
                              <th className="py-3 px-4 text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                            {progression.recentTransactions.map((tx: any) => (
                              <tr key={tx.id} className="hover:bg-white/[0.02]">
                                <td className="py-3 px-4 text-gray-500 text-[10px]">{tx.id}</td>
                                <td className="py-3 px-4 font-bold text-gray-300">{tx.reason}</td>
                                <td className="py-3 px-4 font-black text-cyan-400">+{tx.amount} XP</td>
                                <td className="py-3 px-4 text-gray-400">
                                  Lvl {tx.previousLevel} → Lvl {tx.newLevel}
                                </td>
                                <td className="py-3 px-4 text-right text-gray-500 text-[10px]">
                                  {new Date(tx.createdAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profileTab === 'account' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3"><Key className="text-primary" /> Security Console</h4>
                  <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                      <ShieldAlert size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Biometric Access Update</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1">New Security Phrase (Password)</label>
                        <input type="password" placeholder="••••••••••••" value={editFields.password} onChange={(e) => setEditFields({...editFields, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                      </div>
                      <p className="text-[9px] text-gray-600 uppercase font-bold italic">Changing your password will re-encrypt your wallet and private transmissions.</p>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'style' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3"><Palette className="text-primary" /> Visual Sync</h4>
                  
                  {/* Themes */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">System Architecture (Theme)</label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {THEME_OPTIONS.map(t => {
                        const owned = isThemeOwned(t.shopId);
                        return (
                          <button
                            key={t.id}
                            disabled={!owned}
                            onClick={() => {
                              setTheme(t.id);
                              setEditFields({...editFields, selectedTheme: t.id});
                            }}
                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all relative overflow-hidden ${editFields.selectedTheme === t.id ? 'border-primary bg-primary/10' : owned ? 'border-white/5 bg-white/5 hover:border-white/20' : 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'}`}
                          >
                            <div className={`w-12 h-12 rounded-2xl ${t.color} flex items-center justify-center text-white shadow-lg`}><Palette size={20}/></div>
                            <span className="text-xs font-black uppercase text-white tracking-widest">{t.label}</span>
                            {!owned && <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest text-red-500"><Lock size={12}/> Locked in Store</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profile Border Decorations */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Profile Border Auroras</label>
                    <div className="grid md:grid-cols-2 gap-4">
                       {ownedItems.filter(i => i.type === 'decoration').map(dec => (
                         <button 
                           key={dec.id}
                           onClick={() => toggleActivation(dec.id, 'decoration')}
                           className={`p-5 rounded-3xl border-2 flex items-center justify-between gap-4 transition-all ${profile.activeDecoration === dec.id ? (dec.id === 'd1' ? 'border-cyan-400 bg-cyan-400/10' : 'border-yellow-400 bg-yellow-400/10') : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                         >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${dec.id === 'd1' ? 'bg-cyan-400/20 text-cyan-400' : 'bg-yellow-400/20 text-yellow-400'}`}><Sparkles size={20}/></div>
                              <div className="text-left">
                                <p className="text-sm font-black text-white uppercase">{dec.name}</p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase">PROFILE BORDER</p>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${profile.activeDecoration === dec.id ? (dec.id === 'd1' ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-yellow-500 border-yellow-500 shadow-[0_0_10px_gold]') : 'border-white/20'}`}>
                              {profile.activeDecoration === dec.id && <Check size={14} className="text-black" />}
                            </div>
                         </button>
                       ))}
                       {ownedItems.filter(i => i.type === 'decoration').length === 0 && (
                         <div className="col-span-2 py-8 text-center glass-panel rounded-3xl border-dashed border-white/10">
                           <p className="text-[10px] font-black text-gray-700 uppercase">No decorations in inventory</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'armory' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3"><ShieldCheck className="text-primary" /> The Armory</h4>
                  
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Acquired Roles</label>
                    <div className="grid md:grid-cols-2 gap-4">
                       {ownedItems.filter(i => i.type === 'role').map(role => (
                         <div key={role.id} className="p-5 rounded-3xl border border-orange-500/20 bg-orange-500/5 flex items-center gap-4">
                            <div className="p-3 bg-orange-500 text-white rounded-xl shadow-lg"><ShieldCheck size={20}/></div>
                            <div className="text-left">
                              <p className="text-sm font-black text-white uppercase">{role.name}</p>
                              <p className="text-[8px] font-bold text-orange-500 uppercase">PERMANENT STATUS</p>
                            </div>
                         </div>
                       ))}
                       {ownedItems.filter(i => i.type === 'role').length === 0 && (
                         <div className="col-span-2 py-8 text-center glass-panel rounded-3xl border-dashed border-white/10">
                           <p className="text-[10px] font-black text-gray-700 uppercase">No specialized roles acquired</p>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Installed Plugins</label>
                    <div className="grid md:grid-cols-2 gap-4">
                       {ownedItems.filter(i => i.type === 'plugin').map(plugin => (
                         <button 
                           key={plugin.id}
                           onClick={() => toggleActivation(plugin.id, 'plugin')}
                           className={`p-5 rounded-3xl border-2 flex items-center justify-between gap-4 transition-all ${profile.activePlugin === plugin.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                         >
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white/10 rounded-xl text-purple-400"><Monitor size={20}/></div>
                              <div className="text-left">
                                <p className="text-sm font-black text-white uppercase">{plugin.name}</p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase">SYSTEM PLUGIN</p>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${profile.activePlugin === plugin.id ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                              {profile.activePlugin === plugin.id && <Check size={14} className="text-white" />}
                            </div>
                         </button>
                       ))}
                       {ownedItems.filter(i => i.type === 'plugin').length === 0 && (
                         <div className="col-span-2 py-8 text-center glass-panel rounded-3xl border-dashed border-white/10">
                           <p className="text-[10px] font-black text-gray-700 uppercase">No plugins found in transmission</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'wallet' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3"><Wallet className="text-primary" /> Encarto Wallet</h4>
                  <div className="glass-panel p-12 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-2 border-primary/20 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Current Digital Capital</p>
                    <h5 className="text-6xl font-black text-white tracking-tighter uppercase">{profile.balance.toFixed(2)} <span className="text-sm text-primary">M3GA</span></h5>
                    <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md">
                      <button onClick={onDeposit} className="py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"><Plus size={18} /> Deposit</button>
                      <button onClick={onWithdraw} className="py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all"><CircleMinus size={18} /> Withdraw</button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                     <h6 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Transaction Protocol</h6>
                     <p className="text-xs text-gray-400 leading-relaxed italic">M3GA coins are verified through the Encarto Ledger. Withdrawals may require up to 15 minutes for blockchain validation in high-load scenarios.</p>
                  </div>
                </div>
              )}

              {(profileTab !== 'wallet' && profileTab !== 'armory' && profileTab !== 'progression') && (
                <div className="mt-16 flex justify-end gap-4 border-t border-white/5 pt-10">
                  <button onClick={() => setEditFields({...profile, selectedTheme: activeTheme})} className="px-10 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Discard Sync</button>
                  <button onClick={handleSaveProfile} className="px-12 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                    <Check size={16}/> Push Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
