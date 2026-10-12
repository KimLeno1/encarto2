import React from 'react';
import { Cpu, Database, RefreshCw } from 'lucide-react';

const Operations: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Active Sockets', value: '2,481', trend: '+12%', color: 'text-green-500' },
          { label: 'Total Revenue', value: '142k', trend: '+4.2%', color: 'text-blue-500' },
          { label: 'System Latency', value: '14ms', trend: 'STABLE', color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent group">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h4 className="text-4xl font-black text-white">{stat.value}</h4>
              <span className={`text-[10px] font-black uppercase ${stat.color}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
            <Database size={20} className="text-red-500" /> Server Matrix
          </h3>
          <button className="p-2 text-gray-500 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="space-y-6">
          {['Global Relay', 'Matchmaking Engine', 'Ledger Sync', 'Gemini AI Uplink'].map((node, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${i === 2 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs font-black text-white uppercase">{node}</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Uptime: 42d 11h 04m</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Operations;
