
import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Target, 
  Zap, 
  Clock, 
  ShieldAlert, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  CircleCheck, 
  CircleX,
  Coins,
  Gamepad2,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  Bike
} from 'lucide-react';
import { PlayerProfile, PanelType } from './types.ts';
import PvpChess from './PvpChess.tsx';
import PvpCheckers from './PvpCheckers.tsx';
import PvpCarRacing from './PvpCarRacing.tsx';
import PvpStuntBikeRacing from './PvpStuntBikeRacing.tsx';
import { EncartoArena } from './game/EncartoArena.tsx';

interface DuelOffer {
  id: string;
  creator: string;
  target?: string;
  game: string;
  wager: number;
  createdAt: number;
  status: 'pending' | 'countered' | 'accepted' | 'declined';
  lastCounterBy?: string;
}

const PVP_GAMES = [
  { id: 'g0', name: 'Encarto Arena', icon: <Swords className="text-cyan-400" />, difficulty: 'Playable Realtime Arena' },
  { id: 'g1', name: 'PvP Chess', icon: <LayoutGrid className="text-purple-500" />, difficulty: 'Expert' },
  { id: 'g2', name: 'PvP Checkers', icon: <ArrowRightLeft className="text-red-500" />, difficulty: 'Veteran' },
  { id: 'g3', name: 'PvP Car Racing', icon: <Zap className="text-blue-500" />, difficulty: 'Pro' },
  { id: 'g4', name: 'PvP Stunt Bike Racing', icon: <Bike className="text-green-500" />, difficulty: 'Extreme' },
];

const PvPPanel: React.FC<{ profile: PlayerProfile }> = ({ profile }) => {
  const [offers, setOffers] = useState<DuelOffer[]>([
    { id: 'o1', creator: 'BakugoBoom', game: 'PvP Chess', wager: 50, createdAt: Date.now() - 120000, status: 'pending' },
    { id: 'o2', creator: 'LuffyKing', target: profile.name, game: 'PvP Car Racing', wager: 100, createdAt: Date.now() - 300000, status: 'pending' },
    { id: 'o3', creator: 'ZoroSlash', game: 'PvP Checkers', wager: 75, createdAt: Date.now() - 1500000, status: 'pending' },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newOffer, setNewOffer] = useState({ target: '', game: PVP_GAMES[0].name, wager: 10 });
  const [activeTab, setActiveTab] = useState<'arena' | 'my-duels'>('arena');
  const [activeGameSession, setActiveGameSession] = useState<DuelOffer | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateOffer = () => {
    if (newOffer.wager > profile.balance) {
      alert("Insufficient M3GA coins!");
      return;
    }
    const offer: DuelOffer = {
      id: `duel-${Date.now()}`,
      creator: profile.name,
      target: newOffer.target || undefined,
      game: newOffer.game,
      wager: newOffer.wager,
      createdAt: Date.now(),
      status: 'pending'
    };
    setOffers([offer, ...offers]);
    setIsCreating(false);
    setNewOffer({ target: '', game: PVP_GAMES[0].name, wager: 10 });
  };

  const handleAction = (offerId: string, action: 'accept' | 'decline' | 'counter' | 'enter') => {
    if (action === 'counter') {
      const amount = prompt("Enter your counter wager (M3GA):");
      if (!amount || isNaN(Number(amount))) return;
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, wager: Number(amount), status: 'countered', lastCounterBy: profile.name } : o));
      return;
    }

    if (action === 'enter') {
      const session = offers.find(o => o.id === offerId);
      if (session) setActiveGameSession(session);
      return;
    }

    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: action === 'accept' ? 'accepted' : 'declined' } : o));
    if (action === 'accept') alert("Duel Commencing! Prepare for battle...");
  };

  const handleGameOver = (winner: string) => {
    if (!activeGameSession) return;
    const winnings = (activeGameSession.wager * 2) * 0.8;
    alert(`Tournament Over! ${winner === 'Me' ? 'You' : activeGameSession.creator} won ${winnings.toFixed(1)} M3GA!`);
    setOffers(prev => prev.filter(o => o.id !== activeGameSession.id));
    setActiveGameSession(null);
  };

  const getTimeLeft = (createdAt: number) => {
    const expiry = createdAt + (30 * 60 * 1000);
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const globalArena = offers.filter(o => !o.target && o.status === 'pending' && (now - o.createdAt < 30 * 60 * 1000));
  const myDuels = offers.filter(o => (o.target === profile.name || o.creator === profile.name) && o.status !== 'declined');

  if (activeGameSession) {
    const opponent = activeGameSession.creator === profile.name ? (activeGameSession.target || 'GLOBAL') : activeGameSession.creator;
    return (
      <div className="max-w-6xl mx-auto h-[80vh] flex flex-col">
        <header className="mb-8 flex items-center justify-between">
          <button onClick={() => setActiveGameSession(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
            <CircleX size={20}/> <span className="text-[10px] font-black uppercase">Abort Arena</span>
          </button>
          <div className="text-center">
            <h2 className="anime-title text-3xl text-white uppercase tracking-tighter">{activeGameSession.game}</h2>
            <p className="text-[8px] font-black text-primary uppercase">Active Duel ID: {activeGameSession.id}</p>
          </div>
          <div className="w-24" />
        </header>
        
        <div className="flex-grow overflow-hidden">
          {activeGameSession.game === 'Encarto Arena' && (
            <EncartoArena
              onBackToHub={() => setActiveGameSession(null)}
              playerName={profile.name}
              initialOnline={true}
            />
          )}
          {activeGameSession.game === 'PvP Chess' && <PvpChess wager={activeGameSession.wager} opponent={opponent} onGameOver={handleGameOver} />}
          {activeGameSession.game === 'PvP Checkers' && <PvpCheckers wager={activeGameSession.wager} opponent={opponent} onGameOver={handleGameOver} />}
          {activeGameSession.game === 'PvP Car Racing' && <PvpCarRacing wager={activeGameSession.wager} opponent={opponent} onGameOver={handleGameOver} />}
          {activeGameSession.game === 'PvP Stunt Bike Racing' && <PvpStuntBikeRacing wager={activeGameSession.wager} opponent={opponent} onGameOver={handleGameOver} />}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">Skill Duels</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Wager M3GA coins in high-stakes matches (80% Winner Payout)</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <button onClick={() => setActiveTab('arena')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'arena' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}>Global Arena</button>
            <button onClick={() => setActiveTab('my-duels')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-duels' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}>My Duels</button>
          </div>
          <button onClick={() => setIsCreating(true)} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={16} /> Create Duel
          </button>
        </div>
      </header>

      {isCreating && (
        <div className="glass-panel p-10 rounded-[3rem] border-2 border-primary/20 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Forge A Challenge</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Target Player (Blank for Global)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input type="text" placeholder="Username..." value={newOffer.target} onChange={(e) => setNewOffer({...newOffer, target: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Select Game</label>
              <select value={newOffer.game} onChange={(e) => setNewOffer({...newOffer, game: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all">
                {PVP_GAMES.map(g => <option key={g.id} value={g.name} className="bg-black">{g.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Wager (M3GA)</label>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={16} />
                <input type="number" min="1" value={newOffer.wager} onChange={(e) => setNewOffer({...newOffer, wager: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Abort Mission</button>
            <button onClick={handleCreateOffer} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Issue Challenge</button>
          </div>
        </div>
      )}

      {activeTab === 'arena' ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><RefreshCw className="text-primary animate-spin-slow" size={20} /> Open Market</h4>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{globalArena.length} ACTIVE OFFERS</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {globalArena.map(offer => (
              <div key={offer.id} className="glass-panel rounded-[2.5rem] border border-white/5 p-8 flex flex-col group hover:border-primary/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-all group-hover:opacity-10"><Swords size={120} /></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-primary">
                    {PVP_GAMES.find(g => g.name === offer.game)?.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-gray-600 uppercase mb-1 flex items-center gap-1"><Clock size={10}/> EXPIRES IN</span>
                    <span className="text-sm font-black text-red-500 animate-pulse">{getTimeLeft(offer.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-[10px] font-black text-gray-600 uppercase">Challenger</p>
                  <h5 className="text-xl font-black text-white uppercase">{offer.creator}</h5>
                  <p className="text-[10px] font-bold text-primary uppercase">Game: {offer.game}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-600 uppercase">Stakes</span>
                    <span className="text-2xl font-black text-white">{offer.wager} <span className="text-[10px] text-yellow-500">M3GA</span></span>
                  </div>
                  <button 
                    onClick={() => handleAction(offer.id, 'accept')}
                    disabled={offer.creator === profile.name}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Match Bet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <h4 className="anime-title text-2xl uppercase flex items-center gap-3"><ArrowRightLeft className="text-primary" size={20} /> Duel Log</h4>
          </div>

          <div className="space-y-4">
            {myDuels.length === 0 ? (
              <div className="py-20 text-center glass-panel rounded-[2rem] border-dashed border-white/10">
                <ShieldAlert className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest">No active duels in your transmission.</p>
              </div>
            ) : (
              myDuels.map(offer => (
                <div key={offer.id} className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 shadow-inner">
                      {PVP_GAMES.find(g => g.name === offer.game)?.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">{offer.game}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          offer.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                          offer.status === 'countered' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>{offer.status}</span>
                      </div>
                      <h4 className="text-lg font-black text-white uppercase">
                        {offer.creator === profile.name ? `VS ${offer.target || 'GLOBAL'}` : `${offer.creator} CHALLENGED YOU`}
                      </h4>
                      <p className="text-[10px] font-black text-gray-500 uppercase">POOL: {(offer.wager * 2).toFixed(1)} M3GA (Reward: {(offer.wager*2*0.8).toFixed(1)})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {offer.status === 'accepted' ? (
                      <button onClick={() => handleAction(offer.id, 'enter')} className="px-8 py-3 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-green-500/20 hover:scale-105 transition-all">
                        <Gamepad2 size={16}/> ENTER MATCH
                      </button>
                    ) : offer.creator !== profile.name || offer.status === 'countered' ? (
                      <>
                        <button onClick={() => handleAction(offer.id, 'accept')} className="p-3 bg-green-500/20 text-green-500 rounded-xl hover:bg-green-500/30 transition-all border border-green-500/20"><CircleCheck size={20}/></button>
                        <button onClick={() => handleAction(offer.id, 'counter')} className="p-3 bg-yellow-500/20 text-yellow-500 rounded-xl hover:bg-yellow-500/30 transition-all border border-yellow-500/20"><RefreshCw size={20}/></button>
                        <button onClick={() => handleAction(offer.id, 'decline')} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 transition-all border border-red-500/20"><CircleX size={20}/></button>
                      </>
                    ) : (
                      <span className="text-[10px] font-black text-gray-600 uppercase italic">Awaiting Response...</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PvPPanel;
