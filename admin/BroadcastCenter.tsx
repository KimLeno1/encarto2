import React from 'react';
import { BellRing } from 'lucide-react';

interface BroadcastCenterProps {
  broadcastMsg: string;
  setBroadcastMsg: (val: string) => void;
  onBroadcast: () => void;
}

const BroadcastCenter: React.FC<BroadcastCenterProps> = ({ broadcastMsg, setBroadcastMsg, onBroadcast }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <section className="glass-panel p-10 rounded-[3rem] border border-red-600/20 bg-gradient-to-br from-red-600/10 to-transparent">
        <div className="flex items-center gap-4 mb-8">
          <BellRing className="text-red-500 animate-bounce" size={24} />
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">System-Wide Broadcast</h3>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Message Payload</label>
            <textarea 
              rows={4} 
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Transmit global status update, maintenance alert, or tournament hype..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['info', 'success', 'danger', 'primary'].map(type => (
              <button key={type} className="py-3 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                {type}
              </button>
            ))}
          </div>
          <button 
            onClick={onBroadcast}
            className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            ENGAGE TRANSMISSION
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Recent System Logs</h4>
        <div className="space-y-4">
          {[
            { time: '14:02:11', event: 'Global Ledger Sync Completed', status: 'OK' },
            { time: '13:55:04', event: 'User "ZoroSlash" Flagged for Abrupt Disconnect', status: 'WARN' },
            { time: '13:48:22', event: 'New Item Forge: "Neon Blade" (ID: m4)', status: 'NEW' },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-6 p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px]">
              <span className="text-gray-600">{log.time}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black ${log.status === 'OK' ? 'bg-green-500/10 text-green-500' : log.status === 'WARN' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>{log.status}</span>
              <span className="text-gray-400">{log.event}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BroadcastCenter;
