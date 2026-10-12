import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Users, 
  ShoppingBag, 
  Radio, 
  ShieldAlert, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Globe,
  BellRing,
  ShieldCheck,
  Award,
  Sliders,
  Terminal,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../apiClient.ts';
import { SectionLoader } from '../components.tsx';

export const SystemAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ops' | 'users' | 'matches' | 'audit' | 'config'>('ops');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin Data State
  const [systemStats, setSystemStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Config State
  const [botConfigForm, setBotConfigForm] = useState({
    difficulty: 'normal',
    perceptionRadius: 500,
    reactionDelayMs: 150,
    attackCooldownMs: 500,
    speedMultiplier: 1.0,
  });

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [statsRes, usersRes, matchesRes, auditRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminMatches(),
        api.getAdminAuditLogs(),
      ]);

      setSystemStats(statsRes);
      setUsersList(usersRes.users || []);
      setMatchesList(matchesRes.matches || []);
      setAuditLogs(auditRes.logs || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authorize admin session or fetch terminal data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await api.updateAdminUserRole(userId, newRole);
      if (res.user) {
        setSuccessMsg(`User role successfully updated to ${newRole}`);
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        alert(res.error || 'Failed to update role');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await api.updateAdminUserStatus(userId, newStatus);
      setSuccessMsg(`User status updated to ${newStatus}`);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleGame = async (gameName: string, currentEnabled: boolean) => {
    try {
      await api.configureGame(gameName, !currentEnabled);
      setSuccessMsg(`Game ${gameName} availability toggled.`);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveBotConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.configureBots(botConfigForm.difficulty, {
        perceptionRadius: Number(botConfigForm.perceptionRadius),
        reactionDelayMs: Number(botConfigForm.reactionDelayMs),
        attackCooldownMs: Number(botConfigForm.attackCooldownMs),
        speedMultiplier: Number(botConfigForm.speedMultiplier),
      });
      setSuccessMsg(`Bot difficulty profile [${botConfigForm.difficulty.toUpperCase()}] updated successfully.`);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usersList, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Admin Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-red-500/20 pb-8 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.6)]">
              <ShieldAlert className="text-white" size={26} />
            </div>
            <div>
              <h2 className="anime-title text-4xl sm:text-5xl text-white uppercase tracking-tighter">System Terminal</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                ENCARTO ROOT ACCESS // SERVER AUTHORIZED // NODE-04
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData} 
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2 transition-all"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-red-500' : ''} /> Refresh Telemetry
          </button>
          
          <nav className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ops', label: 'Operations', icon: <Cpu size={14}/> },
              { id: 'users', label: 'Registry', icon: <Users size={14}/> },
              { id: 'matches', label: 'Matches', icon: <Activity size={14}/> },
              { id: 'audit', label: 'Audit Logs', icon: <Terminal size={14}/> },
              { id: 'config', label: 'Platform Config', icon: <Sliders size={14}/> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Success / Error Feedback Alerts */}
      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-400 text-xs font-bold uppercase tracking-wider animate-in fade-in">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider animate-in fade-in">
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      {/* Main Console Area */}
      {isLoading && !systemStats ? (
        <SectionLoader message="Connecting to secure Encarto core..." />
      ) : (
        <div className="space-y-8">

          {/* TAB 1: OPERATIONS & HEALTH MONITOR */}
          {activeTab === 'ops' && systemStats && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
              {/* Service Health Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* API Health */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">REST API Gateway</span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1">Express.js Core</h4>
                    </div>
                    <div className="p-2.5 bg-green-500/20 rounded-xl text-green-400 border border-green-500/30">
                      <Globe size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Operational (200 OK)
                  </div>
                </div>

                {/* Database Health */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Prisma / PostgreSQL</span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1">Relational DB</h4>
                    </div>
                    <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
                      <Database size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    {systemStats.health?.database === 'healthy' ? 'Connected & Synchronized' : 'Fallback Memory Mode Active'}
                  </div>
                </div>

                {/* Socket.IO Health */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Real-Time Engine</span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1">Socket.IO Server</h4>
                    </div>
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30">
                      <Radio size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    Active WebSockets & Rooms
                  </div>
                </div>
              </div>

              {/* Platform Statistics Overview */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
                <h4 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity className="text-red-500" size={20} /> Platform Usage Telemetry
                </h4>
                <div className="grid sm:grid-cols-4 gap-6">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase block">Total Registered Users</span>
                    <span className="text-3xl font-black text-white font-mono mt-1 block">
                      {systemStats.stats?.totalUsers ?? usersList.length}
                    </span>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase block">Total Recorded Matches</span>
                    <span className="text-3xl font-black text-cyan-400 font-mono mt-1 block">
                      {systemStats.stats?.totalMatches ?? matchesList.length}
                    </span>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase block">Active Game Sessions</span>
                    <span className="text-3xl font-black text-yellow-400 font-mono mt-1 block">
                      {systemStats.stats?.activeGameSessions ?? 3}
                    </span>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase block">Server Uptime</span>
                    <span className="text-3xl font-black text-green-400 font-mono mt-1 block">
                      {Math.round((systemStats.health?.uptime || 120) / 60)} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER REGISTRY & ACCOUNT MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-widest">Player Account Registry</h4>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Inspect accounts, modify roles, and manage access privileges</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                      <th className="py-4 px-6">Player</th>
                      <th className="py-4 px-6">Email Registry</th>
                      <th className="py-4 px-6">Rank & EXP</th>
                      <th className="py-4 px-6">Authorization Role</th>
                      <th className="py-4 px-6 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                          <img src={u.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.username} className="w-9 h-9 rounded-full object-cover border border-white/10" alt="Avatar" />
                          <div>
                            <span className="block uppercase">{u.username}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{u.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-400 font-mono">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className="text-primary font-black">Rank {u.rank}</span>
                          <span className="text-gray-500 text-[10px] ml-2">({u.exp} XP)</span>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={u.role || 'USER'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-black uppercase text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="USER" className="bg-black text-white">USER</option>
                            <option value="MODERATOR" className="bg-black text-white">MODERATOR</option>
                            <option value="ORGANIZER" className="bg-black text-white">ORGANIZER</option>
                            <option value="ADMIN" className="bg-black text-white">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleStatusChange(u.id, 'suspended')}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider border border-red-500/30 transition-all"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleStatusChange(u.id, 'active')}
                            className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider border border-green-500/30 transition-all"
                          >
                            Reactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MATCH RECORDS */}
          {activeTab === 'matches' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <h4 className="text-2xl font-black text-white uppercase tracking-widest">Match Records & Outcomes</h4>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Inspect completed match telemetry and score verification</p>

              {matchesList.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl border-dashed border-white/10">
                  <p className="text-xs font-bold text-gray-500 uppercase">No match records logged in current session</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                        <th className="py-4 px-6">Match ID</th>
                        <th className="py-4 px-6">Game Type</th>
                        <th className="py-4 px-6">Participants</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Completed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {matchesList.map((m: any) => (
                        <tr key={m.id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-6 font-mono text-gray-400 text-[11px]">{m.id}</td>
                          <td className="py-4 px-6 font-black text-white uppercase">{m.gameType}</td>
                          <td className="py-4 px-6 font-bold text-gray-300">
                            {m.playerA?.username || 'Player A'} <span className="text-gray-600">vs</span> {m.playerB?.username || m.telemetry?.botName || 'Opponent'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded ${
                              m.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-gray-500 text-[10px]">
                            {m.completedAt ? new Date(m.completedAt).toLocaleString() : 'In Progress'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <h4 className="text-2xl font-black text-white uppercase tracking-widest">Auditable Security Logs</h4>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-wider">Permanent compliance trail of administrative and player transactions</p>

              {auditLogs.length === 0 ? (
                <div className="p-12 text-center glass-panel rounded-3xl border-dashed border-white/10">
                  <p className="text-xs font-bold text-gray-500 uppercase">No audit logs recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                        <th className="py-4 px-6">Action Event</th>
                        <th className="py-4 px-6">Performed By</th>
                        <th className="py-4 px-6">Details Payload</th>
                        <th className="py-4 px-6 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-4 px-6 font-black text-red-400 uppercase">{log.action}</td>
                          <td className="py-4 px-6 text-gray-300">{log.user?.username || log.performedBy || 'System'}</td>
                          <td className="py-4 px-6 text-gray-400 text-[11px] max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </td>
                          <td className="py-4 px-6 text-right text-gray-500 text-[10px]">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLATFORM CONFIGURATION */}
          {activeTab === 'config' && systemStats?.config && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
              <h4 className="text-2xl font-black text-white uppercase tracking-widest">Platform & Game Configuration</h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Game Availability Toggles */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
                  <h5 className="text-sm font-black text-white uppercase tracking-widest">Game Availability</h5>
                  <div className="space-y-4">
                    {Object.entries(systemStats.config.gameAvailability || {}).map(([gameKey, enabled]) => (
                      <div key={gameKey} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{gameKey}</span>
                        <button
                          onClick={() => handleToggleGame(gameKey, Boolean(enabled))}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
                        >
                          {enabled ? 'Active / Online' : 'Disabled / Offline'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bot Difficulty Tuning */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
                  <h5 className="text-sm font-black text-white uppercase tracking-widest">Bot Intelligence Parameters</h5>
                  <form onSubmit={handleSaveBotConfig} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Select Difficulty Profile</label>
                      <select
                        value={botConfigForm.difficulty}
                        onChange={(e) => {
                          const diff = e.target.value;
                          const existing = systemStats.config.botDifficultyParams[diff] || {};
                          setBotConfigForm({ difficulty: diff, ...existing });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Perception Radius</label>
                      <input
                        type="number"
                        value={botConfigForm.perceptionRadius}
                        onChange={(e) => setBotConfigForm({...botConfigForm, perceptionRadius: Number(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Reaction Delay (ms)</label>
                      <input
                        type="number"
                        value={botConfigForm.reactionDelayMs}
                        onChange={(e) => setBotConfigForm({...botConfigForm, reactionDelayMs: Number(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Attack Cooldown (ms)</label>
                      <input
                        type="number"
                        value={botConfigForm.attackCooldownMs}
                        onChange={(e) => setBotConfigForm({...botConfigForm, attackCooldownMs: Number(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all mt-4"
                    >
                      Save Bot Parameters
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SystemAdminPanel;
