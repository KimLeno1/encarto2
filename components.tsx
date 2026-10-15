
import React from 'react';
import { Loader2, Zap, ChevronRight } from 'lucide-react';

export const LogoComponent = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} bg-gradient-to-br from-purple-500 via-fuchsia-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_28px_rgba(192,132,252,0.6)] border border-purple-300/50 transition-all hover:scale-105`}>
    <Zap className="text-white fill-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" size={20} />
  </div>
);

export const SkeletonBlock = ({ className = "h-4 w-full" }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-xl bg-purple-950/40 border border-purple-500/20 skeleton-shimmer ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-purple-400/15 via-cyan-400/20 to-transparent" />
  </div>
);

export const SectionLoader = ({ message }: { message: string }) => (
  <div className="w-full max-w-5xl mx-auto py-8 space-y-6 animate-fade-in">
    {/* Skeleton Header */}
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-8 w-44 rounded-xl" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-80 max-w-full rounded-lg" />
    </div>

    {/* Skeleton Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="p-5 rounded-2xl bg-[#0b0b2b]/60 border border-purple-500/25 space-y-4 relative overflow-hidden">
          <SkeletonBlock className="h-36 w-full rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-1/2 rounded-lg" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <SkeletonBlock className="h-8 w-24 rounded-xl" />
            <SkeletonBlock className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Status Message */}
    <div className="flex items-center justify-center gap-2 pt-2">
      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      <p className="font-heading text-xs font-bold uppercase tracking-widest text-purple-300/80">
        {message}
      </p>
    </div>
  </div>
);

export const NavButton = ({ icon, label, active, onClick, className = "" }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 p-1.5 sm:p-2 transition-all duration-200 group cursor-pointer ${
      active 
        ? 'text-purple-200 scale-105' 
        : 'text-purple-300/60 hover:text-purple-100 hover:scale-102'
    } ${className}`}
  >
    <div className={`p-2 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white ring-1 ring-purple-300/60 shadow-[0_0_22px_rgba(192,132,252,0.7)]' 
        : 'group-hover:bg-purple-800/30'
    }`}>
      {React.cloneElement(icon, { size: 22, className: active ? 'drop-shadow-[0_0_8px_rgba(216,180,254,0.9)]' : '' })}
    </div>
    <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors ${
      active ? 'text-purple-200 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]' : ''
    }`}>
      {label}
    </span>
  </button>
);

export const DropdownItem = ({ icon, label, onClick, color = "text-purple-200" }: any) => (
  <button onClick={() => { onClick(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-800/40 hover:text-white transition-colors text-sm font-bold ${color}`}>
    {icon} <span>{label}</span>
  </button>
);

export interface MoreMenuItemProps {
  icon: React.ReactElement;
  label: string;
  subtitle?: string;
  badge?: string;
  active?: boolean;
  onClick: () => void;
  variant?: 'card' | 'row';
}

export const MoreMenuItem: React.FC<MoreMenuItemProps> = ({ 
  icon, 
  label, 
  subtitle,
  badge,
  active = false, 
  onClick,
  variant = 'row' 
}) => {
  if (variant === 'card') {
    return (
      <button 
        onClick={onClick}
        className={`flex flex-col items-start p-3 sm:p-3.5 rounded-2xl transition-all duration-200 text-left group relative overflow-hidden border cursor-pointer ${
          active 
            ? 'bg-gradient-to-br from-purple-700/60 via-purple-900/80 to-indigo-950/90 border-purple-300 shadow-[0_0_25px_rgba(192,132,252,0.5)]' 
            : 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/25 hover:border-purple-400/60 hover:shadow-[0_0_18px_rgba(192,132,252,0.3)]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-2">
          <div className={`p-2 rounded-xl transition-all ${
            active 
              ? 'bg-purple-500 text-white shadow-[0_0_14px_rgba(216,180,254,0.8)]' 
              : 'bg-purple-900/50 text-purple-200 group-hover:bg-purple-800/70 group-hover:text-white'
          }`}>
            {React.cloneElement(icon, { size: 18 })}
          </div>
          {badge && (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-white group-hover:text-purple-100 line-clamp-1">
          {label}
        </p>
        {subtitle && (
          <p className="text-[10px] text-purple-300/70 font-medium line-clamp-1 mt-0.5">
            {subtitle}
          </p>
        )}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 w-full rounded-xl transition-all duration-200 group border cursor-pointer ${
        active 
          ? 'bg-gradient-to-r from-purple-700/50 to-indigo-900/60 text-white border-purple-400/70 shadow-[0_0_20px_rgba(192,132,252,0.45)]' 
          : 'bg-transparent hover:bg-purple-900/40 text-purple-200/80 hover:text-white border-transparent hover:border-purple-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl transition-all ${
          active 
            ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(216,180,254,0.7)]' 
            : 'bg-purple-950/60 text-purple-300 group-hover:bg-purple-900/70 group-hover:text-purple-100'
        }`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <div className="text-left">
          <p className="text-xs font-black uppercase tracking-wider text-white group-hover:text-purple-100">
            {label}
          </p>
          {subtitle && (
            <p className="text-[10px] text-purple-300/70 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            {badge}
          </span>
        )}
        <ChevronRight size={14} className="text-purple-400/50 group-hover:text-purple-200 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
};


