import React from 'react';
import { Activity, Cpu, Database, TrendingUp, Users, DollarSign, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Active Users', value: '4,281', trend: '+12.5%', icon: <Users size={20} className="text-blue-500" /> },
    { label: 'Avg Latency', value: '14ms', trend: 'STABLE', icon: <Activity size={20} className="text-green-500" /> },
    { label: 'Total M3GA Volume', value: '1.2M', trend: '+4.2%', icon: <DollarSign size={20} className="text-yellow-500" /> },
    { label: 'Compute Load', value: '34%', trend: '-2.1%', icon: <Cpu size={20} className="text-red-500" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-xl">{stat.icon}</div>
              <span className={`text-[10px] font-black uppercase ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-blue-500'}`}>{stat.trend}</span>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-3xl font-black text-white mt-1 uppercase">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 glass-panel p-8 rounded-[2.5rem] border border-white/5">
          <h3 className="text-xl font-black text-white uppercase flex items-center gap-3 mb-8">
            <TrendingUp size={20} className="text-primary" /> Platform Traffic Flow
          </h3>
          <div className="h-64 flex items-end gap-2 px-4">
            {[40, 70, 45, 90, 65, 80, 50, 75, 85, 40, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t-lg group relative hover:bg-primary/40 transition-all" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-primary text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {h}k REQS
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
           <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap size={16} className="text-red-500" /> Active Alerts
              </h4>
              <div className="space-y-4">
                {[
                  { msg: 'Node-04 Re-sync required', type: 'WARN' },
                  { msg: 'Auth flood detected - IP filtered', type: 'INFO' },
                  { msg: 'DB Backup completed successfully', type: 'OK' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-gray-400">{alert.msg}</span>
                    <span className={`text-[8px] font-black uppercase ${alert.type === 'WARN' ? 'text-yellow-500' : alert.type === 'OK' ? 'text-green-500' : 'text-blue-500'}`}>{alert.type}</span>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Internal Systems</h4>
              <div className="space-y-4">
                {['Database', 'Relay', 'Ledger', 'Storage'].map(sys => (
                  <div key={sys} className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase">{sys}</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">Healthy</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
