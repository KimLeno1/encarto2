
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Users, 
  BarChart3, 
  Plus, 
  Settings, 
  Trash2, 
  Play, 
  ChevronRight,
  TrendingUp,
  Target,
  Trophy,
  History,
  Activity
} from 'lucide-react';
import { PlayerProfile, Tournament } from './types';

interface OrganizerPanelProps {
  profile: PlayerProfile;
}

const OrganizerPanel: React.FC<OrganizerPanelProps> = ({ profile }) => {
  // Added missing Tournament properties
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([
    { 
      id: 'org-1', 
      name: 'Legendary Rumble', 
      game: 'Shinobi Clash', 
      date: '2025-06-12', 
      status: 'upcoming', 
      entryFee: 50, 
      prize: '1000 M3GA', 
      organizer: profile.name,
      maxPlayers: 128,
      registeredPlayers: [],
      rules: "Standard tournament rules apply.",
      createdAt: "2025-05-20"
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', game: 'PvP Chess', entryFee: 10, prize: '100 M3GA' });

  const handleCreate = () => {
    // Added missing Tournament properties
    const t: Tournament = {
      id: `t-${Date.now()}`,
      name: newTournament.name,
      game: newTournament.game,
      date: new Date().toLocaleDateString(),
      status: 'upcoming',
      entryFee: newTournament.entryFee,
      prize: newTournament.prize,
      organizer: profile.name,
      maxPlayers: 64,
      registeredPlayers: [],
      rules: "No rules defined yet.",
      createdAt: new Date().toISOString()
    };
    setActiveTournaments([...activeTournaments, t]);
    setIsCreating(false);
  };

  const stats = [
    { label: 'Active Events', value: activeTournaments.length, icon: <Activity className="text-orange-500" /> },
    { label: 'Total Participants', value: '428', icon: <Users className="text-blue-500" /> },
    { label: 'Revenue Cut (10%)', value: '1.2k', icon: <TrendingUp className="text-green-500" /> },
    { label: 'Platform Trust', value: '98%', icon: <ShieldCheck className="text-primary" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">Command Center</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" /> ENCARTO CERTIFIED ORGANIZER: {profile.name}
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Host Tournament
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-lg">{stat.icon}</div>
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Main Console */}
        <div className="lg:col-span-8 space-y-8">
          {isCreating && (
            <div className="glass-panel p-10 rounded-[3rem] border-2 border-orange-600/20 animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Tournament Blueprint</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Event Title</label>
                  <input type="text" placeholder="e.g. Winter Clash 2025" value={newTournament.name} onChange={e => setNewTournament({...newTournament, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:ring-4 focus:ring-orange-600/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Selected Arena</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" value={newTournament.game} onChange={e => setNewTournament({...newTournament, game: e.target.value})}>
                    <option className="bg-black">PvP Chess</option>
                    <option className="bg-black">PvP Car Racing</option>
                    <option className="bg-black">Shinobi Clash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Entry Fee (M3GA)</label>
                  <input type="number" value={newTournament.entryFee} onChange={e => setNewTournament({...newTournament, entryFee: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Prize Structure</label>
                  <input type="text" value={newTournament.prize} onChange={e => setNewTournament({...newTournament, prize: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none" />
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-[10px] font-black text-gray-500 uppercase">Scrap Build</button>
                <button onClick={handleCreate} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-600/20">Finalize Transmission</button>
              </div>
            </div>
          )}

          <section className="space-y-6">
            <h4 className="text-xl font-black text-white uppercase flex items-center gap-3">
              <History className="text-orange-500" /> Active Management
            </h4>
            <div className="space-y-4">
              {activeTournaments.map(t => (
                <div key={t.id} className="glass-panel p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-orange-600/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 border border-white/10">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-white uppercase">{t.name}</h5>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{t.game} • {t.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors border border-white/5"><Settings size={18}/></button>
                    <button className="px-6 py-3 bg-orange-600/10 text-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-600/20 hover:bg-orange-600 hover:text-white transition-all">Launch Brackets</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Tools */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-orange-600/5 to-transparent">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target className="text-orange-500" size={16} /> Organizer Insights
            </h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase">
                  <span>Resource Usage</span>
                  <span>74%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600 w-3/4 shadow-[0_0_10px_#ea580c]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase">
                  <span>Player Engagement</span>
                  <span>92%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[92%] shadow-[0_0_10px_var(--primary)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Support Terminal</h4>
            <div className="space-y-4">
              <button className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase text-left hover:text-white hover:border-orange-600/40 transition-all flex items-center justify-between group">
                Dispute Logs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase text-left hover:text-white hover:border-orange-600/40 transition-all flex items-center justify-between group">
                Platform Rules <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPanel;
