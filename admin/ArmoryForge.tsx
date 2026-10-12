import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Tag, Package, Filter, MoreVertical, Coins } from 'lucide-react';
import { ShopItem } from '../types';

interface ArmoryForgeProps {
  items: ShopItem[];
}

const ArmoryForge: React.FC<ArmoryForgeProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if (confirm("Permanent asset decommissioning? This will remove the item from all platform stores.")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Package size={20} className="text-red-500" /> Asset Management Console
        </h3>
        <button className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-red-600/20 hover:scale-105 transition-all">
          <Plus size={16} /> Mint New Asset
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Filter Assets by Name, Type, or ID Signature..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all"
        />
      </div>

      <div className="glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Item Specification</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Market Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Requirements</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right pr-12">Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-mono text-gray-600 group-hover:text-red-500 transition-colors uppercase tracking-tight">{item.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <Tag size={18} />
                      </div>
                      <span className="text-sm font-black text-white uppercase tracking-tight">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-[6px] text-[8px] font-black uppercase tracking-widest border ${
                      item.type === 'plugin' ? 'bg-purple-600/10 text-purple-500 border-purple-500/20' :
                      item.type === 'theme' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' :
                      item.type === 'role' ? 'bg-orange-600/10 text-orange-500 border-orange-600/20' :
                      'bg-yellow-600/10 text-yellow-500 border-yellow-600/20'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2">
                       <Coins size={14} className="text-yellow-500" />
                       <span className="text-sm font-black text-white">{item.price} <span className="text-[8px] text-gray-500 uppercase">M3GA</span></span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                      {item.requirements ? `Rank ${item.requirements.minRank}+` : 'Universal'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <button title="Modify Asset" className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 group-hover:border-white/20"><Edit3 size={16}/></button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        title="Delete Asset"
                        className="p-2.5 bg-red-600/10 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                      >
                        <Trash2 size={16}/>
                      </button>
                      <button className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 group-hover:border-white/20"><MoreVertical size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
         <div className="py-20 text-center glass-panel rounded-[2.5rem] border border-dashed border-white/10">
            <p className="text-gray-600 font-black uppercase text-xs tracking-widest italic">No matching inventory signals detected in Armory.</p>
         </div>
      )}
    </div>
  );
};

export default ArmoryForge;
