
import React from 'react';
import { UserCheck, Wallet, Plus, CircleMinus, User as UserIcon, Camera, LayoutGrid } from 'lucide-react';
import { PlayerProfile, PanelType } from './types.ts';
import { SectionLoader } from './components.tsx';

interface AdminPanelProps {
  profile: PlayerProfile;
  editFields: any;
  setEditFields: (f: any) => void;
  profileTab: 'identity' | 'account' | 'style' | 'wallet';
  setProfileTab: (t: any) => void;
  isUpdatingProfile: boolean;
  handleSaveProfile: () => void;
  onAvatarClick: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  profile, editFields, setEditFields, profileTab, setProfileTab,
  isUpdatingProfile, handleSaveProfile, onAvatarClick, onDeposit, onWithdraw
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="anime-title text-4xl text-white uppercase tracking-tight">User HQ</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Manage your profile and presence</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {(['identity', 'account', 'style', 'wallet'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setProfileTab(tab)} 
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${profileTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-[2.5rem] border-2 border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><LayoutGrid size={120} /></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <img src={editFields.avatar} className={`w-32 h-32 rounded-full border-4 p-1 transition-all ${editFields.activeDecoration ? 'border-primary shadow-[0_0_20px_var(--primary)]' : 'border-primary/20'}`} alt="Preview" />
                <button onClick={onAvatarClick} className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"><Camera size={16} /></button>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editFields.name}</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">{editFields.team || 'No Team'}</p>
              <div className="w-full h-px bg-white/5 my-6" />
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"><span className="text-gray-600">Rank Progress</span><span className="text-primary">{profile.rank}/15</span></div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" style={{ width: `${(profile.rank / 15) * 100}%` }} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {isUpdatingProfile ? <SectionLoader message="Syncing with Servers..." /> : (
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 min-h-[500px]">
              {profileTab === 'identity' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h4 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3"><UserCheck className="text-primary" /> Public Identity</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Username</label>
                      <input type="text" value={editFields.name} onChange={(e) => setEditFields({...editFields, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Team Tag</label>
                      <input type="text" value={editFields.team} placeholder="e.g. Plus Ultra" onChange={(e) => setEditFields({...editFields, team: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">About Player (Bio)</label>
                    <textarea rows={4} value={editFields.bio} onChange={(e) => setEditFields({...editFields, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" placeholder="Tell the arena about yourself..." />
                  </div>
                </div>
              )}

              {profileTab === 'wallet' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <h4 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3"><Wallet className="text-primary" /> Encarto Wallet</h4>
                  <div className="glass-panel p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/20 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Current Balance</p>
                    <h5 className="text-5xl font-black text-white tracking-tighter uppercase">{profile.balance.toFixed(2)} <span className="text-xs text-primary">M3GA</span></h5>
                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                      <button onClick={onDeposit} className="py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"><Plus size={16} /> Deposit</button>
                      <button onClick={onWithdraw} className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"><CircleMinus size={16} /> Withdraw</button>
                    </div>
                  </div>
                </div>
              )}

              {profileTab !== 'wallet' && (
                <div className="mt-12 flex justify-end gap-4 border-t border-white/5 pt-8">
                  <button onClick={() => setEditFields({...profile})} className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Discard</button>
                  <button onClick={handleSaveProfile} className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">Sync Profile</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
