
import React from 'react';
import { ShoppingBag, Tag, Sparkles, Layout, Monitor, ShieldCheck, Lock, ShieldAlert } from 'lucide-react';
import { ShopItem, PlayerProfile } from './types';

interface StorePanelProps {
  items: ShopItem[];
  profile: PlayerProfile;
  onPurchase: (item: ShopItem) => void;
}

const StorePanel: React.FC<StorePanelProps> = ({ items, profile, onPurchase }) => {
  const categories = ['All Items', 'Themes', 'Plugins', 'Roles', 'Decoration', 'Merch'];

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const userAge = calculateAge(profile.birthday);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">The Armory</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Upgrade your dashboard and presence</p>
        </div>
        <div className="px-6 py-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex items-center gap-3">
          <Tag className="text-yellow-500" size={18} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Season 5 Sale Live</span>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat, idx) => (
          <button key={cat} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${idx === 0 ? 'bg-primary border-primary text-white' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map(item => {
          const isOwned = profile.ownedItems.includes(item.id);
          const meetsRank = !item.requirements?.minRank || profile.rank >= item.requirements.minRank;
          const meetsAge = !item.requirements?.minAge || userAge >= item.requirements.minAge;
          const isLocked = !meetsRank || !meetsAge;

          return (
            <div key={item.id} className={`glass-panel rounded-[2rem] border border-white/5 overflow-hidden group hover:border-primary/40 transition-all flex flex-col relative ${isLocked ? 'opacity-70 grayscale-[0.5]' : ''}`}>
              <div className="aspect-square bg-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest ${
                    item.type === 'plugin' ? 'bg-purple-500/20 text-purple-400' :
                    item.type === 'theme' ? 'bg-blue-500/20 text-blue-400' :
                    item.type === 'role' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.type}
                  </span>
                  {isLocked && <span className="bg-red-500 text-white px-2 py-1 rounded text-[7px] font-black uppercase flex items-center gap-1"><Lock size={8}/> RESTRICTED</span>}
                </div>
                
                <div className="p-8">
                  {item.type === 'plugin' ? <Monitor size={64} className="text-purple-500/50" /> :
                   item.type === 'theme' ? <Layout size={64} className="text-blue-500/50" /> :
                   item.type === 'role' ? <ShieldCheck size={64} className="text-orange-500/50" /> :
                   <ShoppingBag size={64} className="text-yellow-500/50" />}
                </div>

                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShieldAlert className="text-red-500" size={40} />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-relaxed">
                      {!meetsRank && `REQUIRES RANK ${item.requirements?.minRank}`}
                      {!meetsRank && !meetsAge && ' & '}
                      {!meetsAge && `${item.requirements?.minAge}+ YEARS OLD`}
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-6 space-y-4 flex-grow flex flex-col">
                <h4 className="text-lg font-black text-white uppercase tracking-tight">{item.name}</h4>
                <div className="mt-auto flex items-center justify-between">
                  {isOwned ? (
                    <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-1"><ShieldCheck size={12}/> ACQUIRED</span>
                  ) : (
                    <>
                      <span className="text-xl font-black text-white uppercase">{item.price} <span className="text-[10px] text-primary">M3GA</span></span>
                      <button 
                        disabled={isLocked}
                        onClick={() => onPurchase(item)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isLocked ? 'bg-white/5 text-gray-700 border border-white/5' : 'bg-white/5 hover:bg-primary text-gray-400 hover:text-white border border-white/10 hover:border-primary'
                        }`}
                      >
                        Buy Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StorePanel;
