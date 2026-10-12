
import React from 'react';
import { Users, ShieldAlert, Edit2, Info, Plus, Search, User as UserIcon, X } from 'lucide-react';
import { Team, PlayerProfile } from './types';

interface TeamsPanelProps {
  myTeam: Team | null;
  profile: PlayerProfile;
  teams: Team[];
  teamSearchQuery: string;
  setTeamSearchQuery: (q: string) => void;
  isCreatingTeam: boolean;
  setIsCreatingTeam: (v: boolean) => void;
  newTeamData: { name: string; about: string; info: string; image: string };
  setNewTeamData: (d: any) => void;
  handleCreateTeam: () => void;
  handleRequestToJoin: (id: string) => void;
  handleActionOnRequest: (teamId: string, requester: string, action: 'accept' | 'decline') => void;
}

const TeamsPanel: React.FC<TeamsPanelProps> = ({
  myTeam, profile, teams, teamSearchQuery, setTeamSearchQuery,
  isCreatingTeam, setIsCreatingTeam, newTeamData, setNewTeamData,
  handleCreateTeam, handleRequestToJoin, handleActionOnRequest
}) => {
  const query = teamSearchQuery.trim().toLowerCase();
  const filteredTeams = teams.filter(t => !query || `${t.name} ${t.about} ${t.info} ${t.leaderId}`.toLowerCase().includes(query));

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-300 pb-12">
      {myTeam ? (
        <div className="space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <img src={myTeam.image} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-primary/20 shadow-2xl shadow-primary/10" alt="My Team" />
              <div>
                <h2 className="anime-title text-5xl text-white uppercase tracking-tight">{myTeam.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black rounded uppercase tracking-widest">SQUAD LEVEL 12</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{myTeam.memberCount} MEMBERS</span>
                </div>
              </div>
            </div>
            {profile.isLeader && (
              <button onClick={() => alert('Editing functionality groundwork set.')} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                <Edit2 size={16} /> Edit Team Data
              </button>
            )}
          </header>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <section className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><Info className="text-primary" /> Squad Mission</h4>
                <p className="text-gray-400 font-medium leading-relaxed">{myTeam.about}</p>
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black text-primary uppercase tracking-[0.2em]">{myTeam.info}</div>
              </section>

              <section className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><Users className="text-primary" /> Active Roster</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {myTeam.members.map(member => (
                    <div key={member} className="flex flex-col items-center text-center group">
                      <div className="w-20 h-20 rounded-full border-2 border-white/10 p-1 mb-3 group-hover:border-primary/40 transition-all">
                        <div className="w-full h-full bg-white/5 rounded-full flex items-center justify-center">
                          <UserIcon size={24} className="text-gray-600" />
                        </div>
                      </div>
                      <p className="text-xs font-black text-white uppercase tracking-tight truncate w-full">{member}</p>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{member === myTeam.leaderId ? 'Leader' : 'Recruit'}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-8">
              {profile.isLeader && (
                <section className="glass-panel p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><ShieldAlert className="text-primary" /> Incoming Recruits</h4>
                  <div className="space-y-4">
                    {myTeam.joinRequests.length === 0 ? (
                      <p className="text-[10px] text-gray-500 font-black uppercase text-center py-6">No pending requests</p>
                    ) : (
                      myTeam.joinRequests.map(requester => (
                        <div key={requester} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><UserIcon size={14} /></div>
                            <span className="text-[10px] font-black text-white uppercase">{requester}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleActionOnRequest(myTeam!.id, requester, 'accept')} className="py-2 bg-green-500/20 text-green-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-green-500/20 hover:bg-green-500/30">Accept</button>
                            <button onClick={() => handleActionOnRequest(myTeam!.id, requester, 'decline')} className="py-2 bg-red-500/20 text-red-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/30">Decline</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
              
              <section className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Squad Stats</h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-600 uppercase">Tournament Wins</span><span className="text-xl font-black text-white">24</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-600 uppercase">Global Rank</span><span className="text-xl font-black text-primary">#42</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-600 uppercase">Reputation</span><span className="text-xl font-black text-yellow-500">9.8</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="anime-title text-5xl text-white uppercase tracking-tight">The Squad Hub</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Find a home, recruit teammates, or lead your own legion</p>
            </div>
            <button onClick={() => setIsCreatingTeam(true)} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <Plus size={16} /> Forge a Squad
            </button>
          </div>

          {isCreatingTeam && (
            <div className="glass-panel p-10 rounded-[3rem] border-2 border-primary/20 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Establish New Legion</h3>
                <button onClick={() => setIsCreatingTeam(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Legion Name</label>
                    <input type="text" placeholder="e.g. Shadow Vanguard" value={newTeamData.name} onChange={(e) => setNewTeamData({...newTeamData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Team Mantra / About</label>
                    <textarea rows={3} placeholder="Describe your squad mission..." value={newTeamData.about} onChange={(e) => setNewTeamData({...newTeamData, about: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Quick Info / Ranks</label>
                    <input type="text" placeholder="e.g. Focus on FPS, 18+, Casual/Pro" value={newTeamData.info} onChange={(e) => setNewTeamData({...newTeamData, info: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Banner Image URL (Optional)</label>
                    <input type="text" placeholder="https://..." value={newTeamData.image} onChange={(e) => setNewTeamData({...newTeamData, image: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                  </div>
                </div>
              </div>
              <button onClick={handleCreateTeam} className="w-full mt-10 py-5 bg-primary text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Officialize Squad</button>
            </div>
          )}

          <div className="space-y-6">
            <div className="relative group max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={20} />
              <input type="text" placeholder="Search squads, games, leaders, or recruitment info..." value={teamSearchQuery} onChange={(e) => setTeamSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
            </div>

            <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600"><span>Squad directory</span><span>{filteredTeams.length} squad{filteredTeams.length === 1 ? '' : 's'} found</span></div>
            {filteredTeams.length === 0 && <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-sm text-gray-500">No squads match that search. Try a game title or team leader.</div>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeams.map(team => (
                <div key={team.id} className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 hover:border-primary/30 transition-all group">
                  <div className="h-40 relative overflow-hidden">
                    <img src={team.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Team Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-6">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{team.name}</h4>
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">{team.memberCount} MEMBERS</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide line-clamp-2 mb-6">{team.about}</p>
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-600 uppercase">Leader</span>
                        <span className="text-[10px] font-black text-white uppercase">{team.leaderId}</span>
                      </div>
                      <button 
                        onClick={() => handleRequestToJoin(team.id)} 
                        disabled={team.joinRequests.includes(profile.name)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          team.joinRequests.includes(profile.name) 
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' 
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {team.joinRequests.includes(profile.name) ? 'Request Sent' : 'Join Squad'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPanel;
