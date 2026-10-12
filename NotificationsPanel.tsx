
import React from 'react';
import { Bell, ShieldAlert, ShieldCheck, MessageSquare, Trash2, Zap } from 'lucide-react';
import { Notification } from './types';

interface NotificationsPanelProps {
  notifications: Notification[];
  notifFilter: 'all' | 'system' | 'admin' | 'user';
  setNotifFilter: (f: 'all' | 'system' | 'admin' | 'user') => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications, notifFilter, setNotifFilter, markAllRead, deleteNotification
}) => {
  const filteredNotifs = notifications.filter(n => notifFilter === 'all' || n.category === notifFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-300 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="anime-title text-5xl text-white uppercase tracking-tight">Transmission Hub</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">System status, admin logs, and player comms</p>
        </div>
        <button onClick={markAllRead} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Mark All Read</button>
      </header>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {(['all', 'system', 'admin', 'user'] as const).map(f => (
          <button 
            key={f}
            onClick={() => setNotifFilter(f)} 
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
              notifFilter === f 
                ? (f === 'all' ? 'bg-primary border-primary' : f === 'system' ? 'bg-blue-500 border-blue-500' : f === 'admin' ? 'bg-green-500 border-green-500' : 'bg-purple-500 border-purple-500') + ' text-white shadow-lg' 
                : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All Signals' : f === 'system' ? 'System' : f === 'admin' ? 'Admin' : 'Player Comms'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifs.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-[2rem] border-dashed border-white/10">
            <Zap className="mx-auto text-gray-800 mb-4" size={48} />
            <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest">Frequency clear. No messages found.</p>
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div key={n.id} className={`glass-panel p-6 rounded-[2rem] border-l-4 transition-all hover:bg-white/5 group ${!n.read ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 opacity-70'} ${
              n.category === 'system' ? 'border-l-blue-500' : n.category === 'admin' ? 'border-l-green-500' : 'border-l-purple-500'
            }`}>
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <div className={`mt-1 p-2.5 rounded-xl ${
                    n.category === 'system' ? 'bg-blue-500/10 text-blue-500' : n.category === 'admin' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {n.category === 'system' ? <ShieldAlert size={18}/> : n.category === 'admin' ? <ShieldCheck size={18}/> : <MessageSquare size={18}/>}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{n.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10"/>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{n.timestamp}</span>
                      {!n.read && <span className="bg-primary px-1.5 py-0.5 rounded-[4px] text-[7px] font-black text-white uppercase ml-2">NEW</span>}
                    </div>
                    <h4 className={`text-sm font-bold leading-relaxed ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                      {n.sender && <span className="text-primary mr-1">{n.sender}:</span>}
                      {n.message}
                    </h4>
                  </div>
                </div>
                <button onClick={() => deleteNotification(n.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
