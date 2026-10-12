import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Trash2, Key, Activity, BadgeCheck } from 'lucide-react';

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState([
    { id: 'adm-01', name: 'RootNode', level: 'Super Admin', status: 'Active' },
    { id: 'adm-02', name: 'Validator_4', level: 'Moderator', status: 'Active' },
  ]);

  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'Moderator' });

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password) return;
    
    const admin = {
      id: `adm-${Math.floor(Math.random() * 1000)}`,
      name: newAdmin.username,
      level: newAdmin.role,
      status: 'Active'
    };
    
    setAdmins([...admins, admin]);
    setNewAdmin({ username: '', password: '', role: 'Moderator' });
    alert("ADMIN CREDENTIALS INITIALIZED // BROADCASTING UPLINK");
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* Register Section */}
        <section className="glass-panel p-10 rounded-[3rem] border border-red-600/20 bg-red-600/[0.02]">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 mb-8">
            <UserPlus size={24} className="text-red-500" /> Forge Admin Signal
          </h3>
          <form onSubmit={handleRegisterAdmin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Admin Username</label>
              <input 
                type="text" 
                value={newAdmin.username}
                onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                placeholder="ENC-ADM-XXX" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Secure Passphrase</label>
              <input 
                type="password" 
                value={newAdmin.password}
                onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Clearance Level</label>
              <select 
                value={newAdmin.role}
                onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all"
              >
                <option value="Moderator" className="bg-black">Moderator</option>
                <option value="Tournament Organizer" className="bg-black">Tournament Organizer</option>
                <option value="Systems Engineer" className="bg-black">Systems Engineer</option>
                <option value="Super Admin" className="bg-black">Super Admin</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <ShieldCheck size={18} /> Initialize Permissions
            </button>
          </form>
        </section>

        {/* Admin List */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Key size={20} className="text-primary" /> Active Admin Registry
          </h3>
          <div className="grid gap-4">
            {admins.map(adm => (
              <div key={adm.id} className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <BadgeCheck size={24}/>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase">{adm.name}</h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{adm.level} • {adm.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.2em]">{adm.status}</span>
                    <span className="text-[8px] font-mono text-gray-700">ENC-SEC-01</span>
                  </div>
                  <button className="p-3 bg-red-600/10 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-center gap-6">
             <Activity className="text-blue-500 animate-pulse" size={24} />
             <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed tracking-widest">Platform Integrity Protocol: All administrative actions are logged to the immutable global ledger.</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminManagement;
