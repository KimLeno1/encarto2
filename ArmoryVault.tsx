import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Lock, 
  Eye, 
  Search, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Volume2, 
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Radio,
  Flame,
  Award
} from 'lucide-react';
import { ShopItem, PlayerProfile, AnimeTheme } from './types.ts';

export type ArmoryFilterCategory = 'all' | 'halos' | 'titles' | 'badges' | 'sounds';
export type ItemRarity = 'common' | 'rare' | 'epic';

interface ArmoryItem {
  id: string;
  name: string;
  category: ArmoryFilterCategory;
  rarity: ItemRarity;
  price: number;
  description: string;
  previewType: 'halo' | 'title' | 'badge' | 'sound';
  previewDetail: string; // Color, Title text, icon glyph, or audio preview label
  minRank?: number;
  themeKey?: AnimeTheme;
}

interface ArmoryVaultProps {
  profile: PlayerProfile;
  onPurchase: (item: ShopItem) => void;
  onEquip?: (item: ShopItem) => void;
}

export const ARMORY_ITEMS: ArmoryItem[] = [
  // Halos (Decorations / Auroras)
  {
    id: 'd1',
    name: 'Neon Plasma Border',
    category: 'halos',
    rarity: 'common',
    price: 20,
    description: 'Vivid cyan-purple laser halo encircling your avatar.',
    previewType: 'halo',
    previewDetail: '#22d3ee',
    minRank: 1
  },
  {
    id: 'd2',
    name: 'Solar Overdrive Halo',
    category: 'halos',
    rarity: 'rare',
    price: 50,
    description: 'Pulsing ultra-violet and auroral gold ring with coronal flares.',
    previewType: 'halo',
    previewDetail: '#c084fc',
    minRank: 5
  },
  {
    id: 'd3',
    name: 'Cyber God Core Crown',
    category: 'halos',
    rarity: 'epic',
    price: 120,
    description: 'Multi-layer holographic crown with prismatic chromatic shift.',
    previewType: 'halo',
    previewDetail: 'linear-gradient(135deg, #a855f7, #3b82f6)',
    minRank: 10
  },

  // Titles (Role & Identity)
  {
    id: 't-champion',
    name: 'Title: Stadium Vanguard',
    category: 'titles',
    rarity: 'common',
    price: 40,
    description: 'Recognized frontline combatant in the Encarto league circuits.',
    previewType: 'title',
    previewDetail: 'STADIUM VANGUARD',
    minRank: 2
  },
  {
    id: 'role-verified-captain',
    name: 'Title: Elite Commander',
    category: 'titles',
    rarity: 'rare',
    price: 220,
    description: 'Authoritative squad insignia for tactical battlefield leaders.',
    previewType: 'title',
    previewDetail: 'ELITE COMMANDER',
    minRank: 7
  },
  {
    id: 't-grandmaster',
    name: 'Title: Cyber Apex Overlord',
    category: 'titles',
    rarity: 'epic',
    price: 450,
    description: 'Prestigious global esports title etched into the hall of legend.',
    previewType: 'title',
    previewDetail: 'CYBER APEX OVERLORD',
    minRank: 12
  },

  // Badges
  {
    id: 'b-first-blood',
    name: 'Badge: Quirk Overcharge',
    category: 'badges',
    rarity: 'common',
    price: 35,
    description: 'Commemorative medal for hyper-velocity combat engagements.',
    previewType: 'badge',
    previewDetail: '⚡',
    minRank: 1
  },
  {
    id: 'b-ace-pilot',
    name: 'Badge: Quantum Strike Ace',
    category: 'badges',
    rarity: 'rare',
    price: 110,
    description: 'Proof of five consecutive flawless bracket sweeps.',
    previewType: 'badge',
    previewDetail: '🛡️',
    minRank: 6
  },
  {
    id: 'b-legendary-glory',
    name: 'Badge: Zero-Hour Singularity',
    category: 'badges',
    rarity: 'epic',
    price: 300,
    description: 'Forged from championship tournament trophies.',
    previewType: 'badge',
    previewDetail: '👑',
    minRank: 10
  },

  // Sound Packs
  {
    id: 'sp-synthwave',
    name: 'Audio: Synth Neon Stinger',
    category: 'sounds',
    rarity: 'common',
    price: 25,
    description: 'Retro futuristic 80s arcade match-start chime and victory blast.',
    previewType: 'sound',
    previewDetail: 'BPM 128 • Retro Synth',
    minRank: 1
  },
  {
    id: 'sp-hyperdrive',
    name: 'Audio: Hyperdrive Drop Pack',
    category: 'sounds',
    rarity: 'rare',
    price: 90,
    description: 'Bass-heavy sonic boom when entering duel arenas or scoring hits.',
    previewType: 'sound',
    previewDetail: 'Sub-Bass Drop • 808',
    minRank: 4
  },
  {
    id: 'sp-grand-orchestra',
    name: 'Audio: Cyber Symphony Pack',
    category: 'sounds',
    rarity: 'epic',
    price: 280,
    description: 'Full cyberpunk orchestral horns and choral choir for tournament wins.',
    previewType: 'sound',
    previewDetail: 'Orchestral + Modular',
    minRank: 8
  }
];

export const ArmoryVault: React.FC<ArmoryVaultProps> = ({ profile, onPurchase, onEquip }) => {
  const [filter, setFilter] = useState<ArmoryFilterCategory>('all');
  const [search, setSearch] = useState('');
  const [confirmModalItem, setConfirmModalItem] = useState<ArmoryItem | null>(null);
  const [sparklingItemId, setSparklingItemId] = useState<string | null>(null);
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);

  // Filter items
  const filteredItems = ARMORY_ITEMS.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sound preview synthesizer using Web Audio API (lightweight, zero external files)
  const playSoundPreview = (itemId: string, type: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type.includes('Synth')) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      } else if (type.includes('Bass')) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
      }

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      setPreviewingSound(itemId);
      setTimeout(() => setPreviewingSound(null), 600);
    } catch {
      // Audio fallback
      setPreviewingSound(itemId);
      setTimeout(() => setPreviewingSound(null), 600);
    }
  };

  // Sparkle burst execution
  const handleConfirmPurchase = () => {
    if (!confirmModalItem) return;
    const item = confirmModalItem;
    
    // Convert to ShopItem format
    const shopItem: ShopItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.category === 'halos' ? 'decoration' : item.category === 'titles' ? 'role' : 'plugin',
      description: item.description,
      themeKey: item.themeKey
    };

    onPurchase(shopItem);
    setConfirmModalItem(null);

    // Trigger 12 CSS-animated sparkles
    setSparklingItemId(item.id);
    setTimeout(() => {
      setSparklingItemId(null);
    }, 900);
  };

  // Generate 12 radial sparkle trajectories
  const sparkles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 45 + (i % 3) * 15;
    const tx = `${Math.cos(angle) * distance}px`;
    const ty = `${Math.sin(angle) * distance}px`;
    const color = i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#c084fc' : '#f5f3ff';
    return { tx, ty, color, id: i };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Balance badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-[10px] font-black uppercase tracking-widest mb-2">
            <Zap size={12} className="text-cyan-300" /> Tactical Identity Emporium
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            The Armory
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Acquire cosmetic halos, distinguished tournament titles, honor badges, and sound packs.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/40 border border-purple-500/30 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Vault Balance</p>
            <p className="text-sm font-black font-mono text-white">{profile.balance.toFixed(2)} <span className="text-cyan-300">M3GA</span></p>
          </div>
        </div>
      </div>

      {/* Filterable Item Grid Controls (Chips for Halos, Titles, Badges, Sound Packs) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'halos', label: 'Halos' },
            { id: 'titles', label: 'Titles' },
            { id: 'badges', label: 'Badges' },
            { id: 'sounds', label: 'Sound Packs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as ArmoryFilterCategory)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-cyan-400/40'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Armory..."
            className="w-full bg-[#0c0c24] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Armory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const isOwned = profile.ownedItems.includes(item.id);
          const meetsRank = !item.minRank || profile.rank >= item.minRank;
          const canAfford = profile.balance >= item.price;
          const isSparkling = sparklingItemId === item.id;

          // Rarity border & color styling
          // Common = blue, Rare = purple, Epic = gradient
          const rarityStyles = {
            common: {
              border: 'border-blue-500/40 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
              badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              label: 'COMMON',
              textColor: 'text-blue-300',
              glow: 'rgba(59, 130, 246, 0.3)'
            },
            rare: {
              border: 'border-purple-500/50 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
              badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
              label: 'RARE',
              textColor: 'text-purple-300',
              glow: 'rgba(168, 85, 247, 0.4)'
            },
            epic: {
              border: 'border-cyan-400/60 hover:border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.3)] bg-gradient-to-b from-purple-950/20 to-transparent',
              badge: 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-cyan-200 border-cyan-400/40',
              label: 'EPIC',
              textColor: 'bg-gradient-to-r from-purple-300 to-cyan-200 bg-clip-text text-transparent font-black',
              glow: 'rgba(34, 211, 238, 0.5)'
            }
          }[item.rarity];

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl bg-[#0b0b24]/90 border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 ${rarityStyles.border}`}
            >
              {/* Card Top: Live Preview & Rarity */}
              <div className="relative aspect-[16/10] bg-black/40 border-b border-white/5 flex flex-col items-center justify-center p-6 overflow-hidden">
                {/* Background glow orb */}
                <div 
                  className="absolute w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
                  style={{ backgroundColor: item.rarity === 'common' ? '#3b82f6' : item.rarity === 'rare' ? '#a855f7' : '#22d3ee' }}
                />

                {/* Rarity Chip */}
                <span className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${rarityStyles.badge}`}>
                  {rarityStyles.label}
                </span>

                {/* Rank Requirement / Locked Badge */}
                {!meetsRank && (
                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Lock size={10} /> Rank {item.minRank}+
                  </span>
                )}

                {/* LIVE PREVIEW ELEMENT */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {item.previewType === 'halo' && (
                    <div className="relative flex items-center justify-center">
                      <div 
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}
                        style={{
                          borderColor: item.rarity === 'epic' ? '#22d3ee' : item.previewDetail,
                          boxShadow: `0 0 25px ${item.rarity === 'epic' ? '#a855f7' : item.previewDetail}`
                        }}
                      >
                        <Crown size={24} className="text-white drop-shadow-[0_0_8px_white]" />
                      </div>
                    </div>
                  )}

                  {item.previewType === 'title' && (
                    <div className="text-center px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 group-hover:border-cyan-400/40 transition-colors">
                      <span className="text-[10px] font-black tracking-widest uppercase font-mono bg-gradient-to-r from-purple-300 via-cyan-200 to-white bg-clip-text text-transparent">
                        [{item.previewDetail}]
                      </span>
                    </div>
                  )}

                  {item.previewType === 'badge' && (
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                      {item.previewDetail}
                    </div>
                  )}

                  {item.previewType === 'sound' && (
                    <button
                      onClick={() => playSoundPreview(item.id, item.previewDetail)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        previewingSound === item.id
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-purple-400/40'
                      }`}
                    >
                      <Volume2 size={16} className={previewingSound === item.id ? 'animate-bounce text-cyan-300' : ''} />
                      <span className="text-[10px] font-mono font-bold uppercase">
                        {previewingSound === item.id ? 'Playing...' : 'Play Stinger'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-cyan-200 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price & Action Button Area */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Price</span>
                    <p className="text-base font-black font-mono text-white">
                      {item.price} <span className="text-xs text-purple-400">M3GA</span>
                    </p>
                  </div>

                  {/* Sparkle burst overlay container */}
                  <div className="relative">
                    {isSparkling && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                        {sparkles.map(sp => (
                          <div
                            key={sp.id}
                            className="sparkle-particle absolute w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: sp.color,
                              '--tx': sp.tx,
                              '--ty': sp.ty,
                              boxShadow: `0 0 10px ${sp.color}`
                            } as React.CSSProperties}
                          />
                        ))}
                      </div>
                    )}

                    {isOwned ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                        <Check size={14} /> Owned
                      </span>
                    ) : !meetsRank ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-500 text-xs font-black uppercase tracking-wider cursor-not-allowed">
                        <Lock size={12} /> Rank {item.minRank}
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmModalItem(item)}
                        disabled={!canAfford}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 min-h-[44px] ${
                          canAfford
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]'
                            : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Buy' : 'Low M3GA'}
                        <ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Step Modal */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0d0d29] border border-purple-500/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.35)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                Confirm Acquisition
              </span>
              <button
                onClick={() => setConfirmModalItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/40 mx-auto flex items-center justify-center text-purple-300 mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase">{confirmModalItem.name}</h3>
              <p className="text-xs text-slate-400">{confirmModalItem.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400">Total Deducted:</span>
              <span className="text-base font-black text-cyan-300">{confirmModalItem.price} M3GA</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModalItem(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-wider text-slate-300 hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95 transition-all"
              >
                Confirm Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
