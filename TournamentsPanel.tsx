
import React, { useState } from 'react';
// Corrected non-existent ShieldInfo to Shield
import { Trophy, Calendar, Users, Star, ArrowRight, CheckCircle2, QrCode, X, Info, Shield, UserPlus, Clock } from 'lucide-react';
import { Tournament, Ticket, PlayerProfile } from './types';

interface TournamentsPanelProps {
  tournaments: Tournament[];
  onRegister: (t: Tournament) => Ticket | undefined;
  tickets: Ticket[];
  profile: PlayerProfile;
}

const TournamentsPanel: React.FC<TournamentsPanelProps> = ({ tournaments, onRegister, tickets, profile }) => {
  const [successTicket, setSuccessTicket] = useState<Ticket | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);

  const handleRegister = (t: Tournament) => {
    const ticket = onRegister(t);
    if (ticket) {
      setSuccessTicket(ticket);
      // Update viewing modal if open
      if (viewingTournament?.id === t.id) {
        setViewingTournament({
          ...t,
          registeredPlayers: [...t.registeredPlayers, profile.name]
        });
      }
    }
  };

  const isRegistered = (tournamentName: string) => {
    return tickets.some(ticket => ticket.tournamentName === tournamentName);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Success Modal */}
      {successTicket && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-md rounded-[3rem] overflow-hidden border-2 border-primary shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="anime-title text-4xl text-white uppercase tracking-tight">Deployment Confirmed</h3>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Your arena pass has been generated</p>
              
              <div className="w-full p-8 bg-white rounded-[2rem] shadow-inner mt-4">
                <QrCode size={180} className="text-black mx-auto" />
                <p className="mt-4 text-black font-black text-xs tracking-[0.4em] uppercase">{successTicket.id}</p>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="text-xl font-black text-white uppercase">{successTicket.tournamentName}</h4>
                <p className="text-primary font-black text-[10px] uppercase tracking-widest">{successTicket.date}</p>
              </div>

              <button 
                onClick={() => setSuccessTicket(null)}
                className="w-full py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10"
              >
                CLOSE ACCESS LOG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Detail Modal */}
      {viewingTournament && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-4xl max-h-[85vh] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
            <header className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">{viewingTournament.name}</h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{viewingTournament.game}</p>
                </div>
              </div>
              <button onClick={() => setViewingTournament(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </header>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-10">
              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                  <section className="space-y-4">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                      {/* Changed ShieldInfo to Shield */}
                      <Shield size={14} className="text-primary" /> Rules of Engagement
                    </h4>
                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                      <p className="text-gray-300 font-medium leading-relaxed whitespace-pre-line">{viewingTournament.rules}</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                      <Users size={14} className="text-primary" /> Deployed Contenders ({viewingTournament.registeredPlayers.length}/{viewingTournament.maxPlayers})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {viewingTournament.registeredPlayers.map((player, i) => (
                        <div key={i} className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                            {player.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black text-white uppercase truncate">{player}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="lg:col-span-4 space-y-8">
                  <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-white/5 space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Prize Pool</span>
                        <span className="text-3xl font-black text-yellow-500 uppercase">{viewingTournament.prize}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Entry Fee</span>
                        <span className="text-2xl font-black text-white uppercase">{viewingTournament.entryFee} <span className="text-xs text-primary">M3GA</span></span>
                      </div>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-500 uppercase">Start Date</span>
                        <span className="text-[10px] font-black text-white uppercase">{viewingTournament.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-500 uppercase">Created On</span>
                        <span className="text-[10px] font-black text-white uppercase">{viewingTournament.createdAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-500 uppercase">Slots Taken</span>
                        <span className="text-[10px] font-black text-white uppercase">{viewingTournament.registeredPlayers.length} / {viewingTournament.maxPlayers}</span>
                      </div>
                    </div>
                  </div>

                  {!isRegistered(viewingTournament.name) && (
                    <button 
                      onClick={() => handleRegister(viewingTournament)}
                      disabled={viewingTournament.registeredPlayers.length >= viewingTournament.maxPlayers}
                      className={`w-full py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${
                        viewingTournament.registeredPlayers.length >= viewingTournament.maxPlayers
                        ? 'bg-red-500/20 text-red-500 cursor-not-allowed border border-red-500/20'
                        : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {viewingTournament.registeredPlayers.length >= viewingTournament.maxPlayers ? 'ARENA FULL' : (
                        <><UserPlus size={18} /> DEPLOY NOW</>
                      )}
                    </button>
                  )}
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">The Pro Arena</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Global tournaments and season qualifiers</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={18} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{tournaments.length} Active Seasons</span>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {tournaments.map(t => {
          const registered = isRegistered(t.name);
          const slotsTaken = t.registeredPlayers.length;
          const isFull = slotsTaken >= t.maxPlayers;
          
          return (
            <div key={t.id} className={`glass-panel rounded-[2.5rem] border overflow-hidden group transition-all duration-500 flex flex-col ${registered ? 'border-green-500/40 bg-green-500/5' : 'border-white/5 hover:border-primary/40'}`}>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-[8px] font-black rounded uppercase tracking-widest">{t.game}</span>
                    <span className="px-3 py-1 bg-white/5 text-gray-500 text-[8px] font-black rounded uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {t.date}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${registered ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {registered ? 'ENROLLED' : (isFull ? 'CAPACITY REACHED' : t.status)}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase leading-none mb-4 group-hover:text-primary transition-colors cursor-pointer" onClick={() => setViewingTournament(t)}>{t.name}</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                        <span>Contenders</span>
                        <span>{slotsTaken} / {t.maxPlayers}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-primary shadow-[0_0_10px_#3b82f6]'}`} 
                          style={{ width: `${(slotsTaken / t.maxPlayers) * 100}%` }} 
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Prize Reward</p>
                      <p className="text-xl font-black text-yellow-500 uppercase">{t.prize}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex border-t border-white/5">
                <button 
                  onClick={() => setViewingTournament(t)}
                  className="flex-1 py-6 bg-white/5 hover:bg-white/10 text-white font-black text-[12px] uppercase tracking-[0.2em] border-r border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <Info size={16} /> DETAILS
                </button>
                <button 
                  onClick={() => handleRegister(t)}
                  disabled={registered || isFull}
                  className={`flex-[2] py-6 transition-all font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${
                    registered 
                      ? 'bg-green-500 text-white cursor-default' 
                      : isFull
                      ? 'bg-red-500/10 text-red-500 cursor-not-allowed opacity-50'
                      : 'bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white'
                  }`}
                >
                  {registered ? (
                    <>REGISTERED <CheckCircle2 size={16} /></>
                  ) : isFull ? (
                    <>ARENA FULL <X size={16} /></>
                  ) : (
                    <>REGISTER NOW <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TournamentsPanel;
