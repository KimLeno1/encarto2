
import React from 'react';
import { Loader2, Zap } from 'lucide-react';

export const LogoComponent = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/20 transition-all`}>
    <Zap className="text-white fill-current" size={20} />
  </div>
);

export const SectionLoader = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-500">
    <div className="relative">
      <Loader2 className="w-16 h-16 animate-spin text-primary" />
      <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse rounded-full" />
    </div>
    <p className="anime-title text-xl text-gray-400 tracking-widest animate-pulse uppercase">{message}</p>
  </div>
);

export const NavButton = ({ icon, label, active, onClick, className = "" }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'text-primary scale-110' : 'text-gray-500'} ${className}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-primary/10' : ''}`}>{React.cloneElement(icon, { size: 24 })}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export const DropdownItem = ({ icon, label, onClick, color = "text-gray-400" }: any) => (
  <button onClick={() => { onClick(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm font-bold ${color}`}>
    {icon} <span>{label}</span>
  </button>
);

export const MoreMenuItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={() => { onClick(); }}
    className={`flex items-center gap-4 px-6 py-4 w-full transition-all group ${active ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-primary/20 shadow-[0_0_10px_var(--primary)]' : 'bg-white/5 group-hover:bg-white/10'}`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-sm font-black uppercase tracking-widest">{label}</span>
  </button>
);
