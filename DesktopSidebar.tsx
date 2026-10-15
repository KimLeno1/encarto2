import React from 'react';
import { 
  Gamepad2, 
  Swords, 
  Trophy, 
  Users, 
  Store, 
  Wallet,
  MessageSquare, 
  MonitorPlay, 
  Newspaper, 
  Medal, 
  Ticket as TicketIcon, 
  ShieldCheck, 
  Settings,
  CalendarDays,
  Info,
  Flame
} from 'lucide-react';
import { PanelType, PlayerProfile } from './types.ts';

interface DesktopSidebarProps {
  activePanel: PanelType;
  profileTab?: string;
  onSelectPanel: (panel: PanelType, tab?: any) => void;
  profile: PlayerProfile;
  hasOrganizerRole?: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activePanel,
  profileTab,
  onSelectPanel,
  profile,
  hasOrganizerRole = false,
}) => {
  const navItems = [
    {
      panel: PanelType.MAIN,
      label: 'Mission Lobby',
      shortLabel: 'Lobby',
      icon: <Gamepad2 size={22} />,
      isActive: activePanel === PanelType.MAIN,
    },
    {
      panel: PanelType.ARENA,
      label: 'Combat Arena',
      shortLabel: 'Arena',
      icon: <Swords size={22} />,
      isActive: activePanel === PanelType.ARENA,
      badge: 'HOT',
    },
    {
      panel: PanelType.TOURNAMENTS,
      label: 'Tournaments',
      shortLabel: 'Tourneys',
      icon: <Trophy size={22} />,
      isActive: activePanel === PanelType.TOURNAMENTS,
    },
    {
      panel: PanelType.TEAMS,
      label: 'Squad & Clans',
      shortLabel: 'Squad',
      icon: <Users size={22} />,
      isActive: activePanel === PanelType.TEAMS,
    },
    {
      panel: PanelType.STORE,
      label: 'Armory Vault',
      shortLabel: 'Armory',
      icon: <Store size={22} />,
      isActive: activePanel === PanelType.STORE,
    },
    {
      panel: PanelType.PVP,
      label: 'Skill Duels',
      shortLabel: 'Duels',
      icon: <Flame size={22} />,
      isActive: activePanel === PanelType.PVP,
    },
    {
      panel: PanelType.HALL_OF_FAME,
      label: 'Hall of Fame',
      shortLabel: 'Legends',
      icon: <Medal size={22} />,
      isActive: activePanel === PanelType.HALL_OF_FAME,
    },
    {
      panel: PanelType.STREAMING,
      label: 'Stream Broadcasts',
      shortLabel: 'Streams',
      icon: <MonitorPlay size={22} />,
      isActive: activePanel === PanelType.STREAMING,
    },
    {
      panel: PanelType.CHAT,
      label: 'Global Chat',
      shortLabel: 'Chat',
      icon: <MessageSquare size={22} />,
      isActive: activePanel === PanelType.CHAT,
    },
    {
      panel: PanelType.BLOG,
      label: 'News & Meta',
      shortLabel: 'News',
      icon: <Newspaper size={22} />,
      isActive: activePanel === PanelType.BLOG,
    },
    {
      panel: PanelType.FIXTURES,
      label: 'Match Schedules',
      shortLabel: 'Fixtures',
      icon: <CalendarDays size={22} />,
      isActive: activePanel === PanelType.FIXTURES,
    },
    {
      panel: PanelType.TICKETS,
      label: 'Access Passes',
      shortLabel: 'Passes',
      icon: <TicketIcon size={22} />,
      isActive: activePanel === PanelType.TICKETS,
    },
    ...(hasOrganizerRole ? [{
      panel: PanelType.ORGANIZER,
      label: 'Host Console',
      shortLabel: 'Host',
      icon: <ShieldCheck size={22} />,
      isActive: activePanel === PanelType.ORGANIZER,
      badge: 'HOST',
    }] : []),
    ...(profile.isSystemAdmin ? [{
      panel: PanelType.SYSTEM_ADMIN,
      label: 'System Admin',
      shortLabel: 'Admin',
      icon: <ShieldCheck size={22} />,
      isActive: activePanel === PanelType.SYSTEM_ADMIN,
      badge: 'ROOT',
    }] : []),
    {
      panel: PanelType.ADMIN,
      label: 'Profile & Settings',
      shortLabel: 'Settings',
      icon: <Settings size={22} />,
      isActive: activePanel === PanelType.ADMIN,
    },
    {
      panel: PanelType.ABOUT,
      label: 'Lore & Manifesto',
      shortLabel: 'About',
      icon: <Info size={22} />,
      isActive: activePanel === PanelType.ABOUT,
    },
  ];

  return (
    <aside className="relative shrink-0 hidden md:block select-none z-[110]">
      {/* Structural Spacer reserving 72px layout width */}
      <div className="w-[72px] h-full" />

      {/* Hover-expanding Rail (72px collapsed, 240px expanded) */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-[72px] hover:w-[240px] group/sidebar bg-[#07051a]/95 backdrop-blur-2xl border-r border-purple-500/25 shadow-[4px_0_30px_rgba(7,5,26,0.9)] transition-[width] duration-300 ease-out overflow-hidden flex flex-col justify-between py-4"
        style={{ willChange: 'width' }}
      >
        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 px-2.5">
          {navItems.map((item) => {
            return (
              <button
                key={item.label}
                onClick={() => onSelectPanel(item.panel)}
                className={`relative flex items-center h-12 w-full rounded-xl transition-colors duration-150 cursor-pointer overflow-hidden group/item ${
                  item.isActive
                    ? 'bg-gradient-to-r from-purple-900/50 via-purple-950/40 to-transparent text-white'
                    : 'text-[#a5b4fc]/70 hover:text-white hover:bg-purple-950/40'
                }`}
                title={item.label}
              >
                {/* Active Neon Bar Indicator on Left Edge */}
                {item.isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-purple-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                )}

                {/* 44px Icon Container centered in 72px collapsed rail */}
                <div className="w-[48px] h-12 shrink-0 flex items-center justify-center">
                  <div className={`transition-transform duration-200 group-hover/item:scale-110 ${
                    item.isActive 
                      ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                      : 'text-[#a5b4fc]/80 group-hover/item:text-purple-200'
                  }`}>
                    {item.icon}
                  </div>
                </div>

                {/* Transform-based label reveal */}
                <div className="flex items-center justify-between flex-1 pr-3 whitespace-nowrap opacity-0 -translate-x-3 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-200 ease-out pointer-events-none group-hover/sidebar:pointer-events-auto">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    item.isActive ? 'text-white font-extrabold' : 'text-[#f5f3ff]'
                  }`}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_6px_rgba(34,211,238,0.4)]">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info in expanded sidebar */}
        <div className="pt-3 border-t border-purple-500/20 px-3 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-mono text-[#a5b4fc]/70 uppercase tracking-widest">
              Stadium Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
