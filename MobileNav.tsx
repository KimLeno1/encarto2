import React, { useEffect } from 'react';
import { 
  Swords, 
  Trophy, 
  Users, 
  Wallet, 
  LayoutGrid, 
  X, 
  MessageSquare, 
  MonitorPlay, 
  Newspaper, 
  Medal, 
  Store, 
  Ticket as TicketIcon, 
  ShieldCheck, 
  Settings,
  Gamepad2,
  CalendarDays,
  Info
} from 'lucide-react';
import { PanelType, PlayerProfile } from './types.ts';

interface MobileNavProps {
  activePanel: PanelType;
  profileTab?: string;
  onSelectTab: (tab: 'arena' | 'tournaments' | 'squad' | 'wallet' | 'more') => void;
  onSelectPanel: (panel: PanelType, tab?: any) => void;
  showMoreSheet: boolean;
  setShowMoreSheet: (show: boolean) => void;
  profile: PlayerProfile;
  hasOrganizerRole?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePanel,
  profileTab,
  onSelectTab,
  onSelectPanel,
  showMoreSheet,
  setShowMoreSheet,
  profile,
  hasOrganizerRole = false,
}) => {
  // Determine active mobile tab index (0: Arena, 1: Tournaments, 2: Squad, 3: Wallet, 4: More)
  let activeIndex = -1;
  if (showMoreSheet) {
    activeIndex = 4;
  } else if (activePanel === PanelType.ARENA) {
    activeIndex = 0;
  } else if (activePanel === PanelType.TOURNAMENTS) {
    activeIndex = 1;
  } else if (activePanel === PanelType.TEAMS) {
    activeIndex = 2;
  } else if (activePanel === PanelType.ADMIN && profileTab === 'wallet') {
    activeIndex = 3;
  } else {
    // If user is on a panel that lives inside "More", show More as active
    activeIndex = 4;
  }

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoreSheet(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowMoreSheet]);

  // List of items for More bottom sheet grid (Chat, Stream, News, Hall of Fame, Armory, Passes, Host Console, Admin)
  const moreCards = [
    {
      id: 'chat',
      panel: PanelType.CHAT,
      label: 'Chat',
      subtitle: 'Global & Squad Comms',
      icon: <MessageSquare className="w-5 h-5 text-cyan-300" />,
      badge: 'LIVE',
    },
    {
      id: 'stream',
      panel: PanelType.STREAMING,
      label: 'Stream',
      subtitle: 'Broadcast Matches',
      icon: <MonitorPlay className="w-5 h-5 text-purple-300" />,
      badge: 'HD',
    },
    {
      id: 'news',
      panel: PanelType.BLOG,
      label: 'News',
      subtitle: 'Meta & Patch Notes',
      icon: <Newspaper className="w-5 h-5 text-blue-300" />,
      badge: 'UPDATES',
    },
    {
      id: 'hall_of_fame',
      panel: PanelType.HALL_OF_FAME,
      label: 'Hall of Fame',
      subtitle: 'Legendary Champions',
      icon: <Medal className="w-5 h-5 text-amber-300" />,
      badge: 'MVPs',
    },
    {
      id: 'armory',
      panel: PanelType.STORE,
      label: 'Armory',
      subtitle: 'Vault & Cyber Skins',
      icon: <Store className="w-5 h-5 text-fuchsia-300" />,
      badge: 'VAULT',
    },
    {
      id: 'passes',
      panel: PanelType.TICKETS,
      label: 'Passes',
      subtitle: 'Access Clearances',
      icon: <TicketIcon className="w-5 h-5 text-emerald-300" />,
      badge: 'QR CODE',
    },
    {
      id: 'host_console',
      panel: PanelType.ORGANIZER,
      label: 'Host Console',
      subtitle: 'Deploy Brackets',
      icon: <ShieldCheck className="w-5 h-5 text-cyan-300" />,
      badge: hasOrganizerRole ? 'ACTIVE' : 'LOCKED',
      hidden: !hasOrganizerRole && !profile.isSystemAdmin,
    },
    {
      id: 'admin',
      panel: profile.isSystemAdmin ? PanelType.SYSTEM_ADMIN : PanelType.ADMIN,
      label: 'Admin',
      subtitle: profile.isSystemAdmin ? 'System Ops & Audit' : 'Player Preferences',
      icon: <Settings className="w-5 h-5 text-purple-400" />,
      badge: profile.isSystemAdmin ? 'ROOT' : 'CONFIG',
    },
    {
      id: 'lobby',
      panel: PanelType.MAIN,
      label: 'Lobby',
      subtitle: 'Mission Control',
      icon: <Gamepad2 className="w-5 h-5 text-cyan-200" />,
    },
    {
      id: 'fixtures',
      panel: PanelType.FIXTURES,
      label: 'Fixtures',
      subtitle: 'Match Schedules',
      icon: <CalendarDays className="w-5 h-5 text-purple-200" />,
    },
  ].filter(card => !card.hidden);

  return (
    <>
      {/* Floating Bottom Tab Bar for Mobile */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-3 sm:inset-x-6 sm:bottom-4 max-w-md mx-auto z-[150] select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="relative flex items-center justify-between p-1.5 rounded-full bg-[#0b0b2b]/92 backdrop-blur-xl border border-purple-500/40 shadow-[0_8px_32px_rgba(7,5,26,0.85),0_0_20px_rgba(168,85,247,0.25)]">
          
          {/* Sliding Neon Gradient Indicator */}
          <div 
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-purple-600/40 via-purple-500/35 to-blue-500/40 border border-purple-400/60 shadow-[0_0_16px_rgba(168,85,247,0.55)] pointer-events-none transition-transform duration-300 ease-out will-change-transform"
            style={{
              width: 'calc((100% - 12px) / 5)',
              left: '6px',
              transform: `translateX(${activeIndex * 100}%)`,
              opacity: activeIndex >= 0 ? 1 : 0
            }}
          />

          {/* 1. Arena */}
          <button
            onClick={() => onSelectTab('arena')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] relative z-10 transition-transform active:scale-95 cursor-pointer"
          >
            <div className={`transition-all duration-200 ${activeIndex === 0 ? 'scale-110 -translate-y-0.5' : 'text-[#a5b4fc]/70 hover:text-white'}`}>
              <Swords 
                size={22} 
                className={activeIndex === 0 ? 'text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]' : ''} 
              />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 transition-colors ${activeIndex === 0 ? 'text-purple-200 font-extrabold drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]' : 'text-[#a5b4fc]/70'}`}>
              Arena
            </span>
          </button>

          {/* 2. Tournaments */}
          <button
            onClick={() => onSelectTab('tournaments')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] relative z-10 transition-transform active:scale-95 cursor-pointer"
          >
            <div className={`transition-all duration-200 ${activeIndex === 1 ? 'scale-110 -translate-y-0.5' : 'text-[#a5b4fc]/70 hover:text-white'}`}>
              <Trophy 
                size={22} 
                className={activeIndex === 1 ? 'text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]' : ''} 
              />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 transition-colors ${activeIndex === 1 ? 'text-purple-200 font-extrabold drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]' : 'text-[#a5b4fc]/70'}`}>
              Tourneys
            </span>
          </button>

          {/* 3. Squad */}
          <button
            onClick={() => onSelectTab('squad')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] relative z-10 transition-transform active:scale-95 cursor-pointer"
          >
            <div className={`transition-all duration-200 ${activeIndex === 2 ? 'scale-110 -translate-y-0.5' : 'text-[#a5b4fc]/70 hover:text-white'}`}>
              <Users 
                size={22} 
                className={activeIndex === 2 ? 'text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]' : ''} 
              />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 transition-colors ${activeIndex === 2 ? 'text-purple-200 font-extrabold drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]' : 'text-[#a5b4fc]/70'}`}>
              Squad
            </span>
          </button>

          {/* 4. Wallet */}
          <button
            onClick={() => onSelectTab('wallet')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] relative z-10 transition-transform active:scale-95 cursor-pointer"
          >
            <div className={`transition-all duration-200 ${activeIndex === 3 ? 'scale-110 -translate-y-0.5' : 'text-[#a5b4fc]/70 hover:text-white'}`}>
              <Wallet 
                size={22} 
                className={activeIndex === 3 ? 'text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]' : ''} 
              />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 transition-colors ${activeIndex === 3 ? 'text-cyan-200 font-extrabold drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'text-[#a5b4fc]/70'}`}>
              Wallet
            </span>
          </button>

          {/* 5. More */}
          <button
            onClick={() => onSelectTab('more')}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] relative z-10 transition-transform active:scale-95 cursor-pointer"
          >
            <div className={`transition-all duration-200 ${activeIndex === 4 ? 'scale-110 -translate-y-0.5' : 'text-[#a5b4fc]/70 hover:text-white'}`}>
              {showMoreSheet ? (
                <X size={22} className="text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
              ) : (
                <LayoutGrid size={22} className={activeIndex === 4 ? 'text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]' : ''} />
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 transition-colors ${activeIndex === 4 ? 'text-purple-200 font-extrabold drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]' : 'text-[#a5b4fc]/70'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet with tap-outside backdrop & drag handle */}
      {showMoreSheet && (
        <>
          {/* Tap-outside Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 z-[190] animate-in fade-in duration-200"
            onClick={() => setShowMoreSheet(false)}
          />

          {/* Bottom Sheet Container */}
          <div 
            className="fixed bottom-0 left-0 right-0 max-h-[82vh] z-[200] rounded-t-[28px] bg-[#0b0b2b]/96 backdrop-blur-2xl border-t border-x border-purple-500/40 shadow-[0_-12px_45px_rgba(7,5,26,0.9),0_0_30px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col bottom-sheet-anim"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
          >
            {/* Drag Handle */}
            <div 
              className="py-3 flex flex-col items-center cursor-pointer select-none"
              onClick={() => setShowMoreSheet(false)}
            >
              <div className="w-12 h-1.5 rounded-full bg-purple-400/50 shadow-[0_0_8px_rgba(192,132,252,0.4)]" />
            </div>

            {/* Header */}
            <div className="px-6 pb-3 pt-1 flex items-center justify-between border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                <h3 className="cyber-heading text-sm font-bold text-[#f5f3ff] tracking-wider uppercase">
                  ENCARTO SYSTEM HUB
                </h3>
              </div>
              <button
                onClick={() => setShowMoreSheet(false)}
                className="w-8 h-8 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white hover:bg-purple-900/60 transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* 2-Column Grid with 40ms stagger animation */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-3 pb-8">
                {moreCards.map((card, idx) => {
                  const isActive = activePanel === card.panel;
                  return (
                    <button
                      key={card.id}
                      onClick={() => {
                        onSelectPanel(card.panel);
                        setShowMoreSheet(false);
                      }}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className={`stagger-card-item cyber-card flex flex-col text-left p-3.5 rounded-[16px] cursor-pointer group select-none min-h-[76px] ${
                        isActive
                          ? 'border-purple-400 bg-gradient-to-br from-purple-900/60 to-[#0b0b2b] shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                          : 'hover:border-purple-400/60 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`p-2 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-purple-500/40 text-white shadow-[0_0_12px_rgba(192,132,252,0.8)]' 
                            : 'bg-purple-950/70 group-hover:bg-purple-900/60'
                        }`}>
                          {card.icon}
                        </div>
                        {card.badge && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-900/50 text-cyan-300 border border-cyan-400/30 shadow-[0_0_6px_rgba(34,211,238,0.3)]">
                            {card.badge}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold uppercase tracking-wider text-[#f5f3ff] group-hover:text-cyan-200 transition-colors">
                        {card.label}
                      </span>
                      <span className="text-[10px] text-[#a5b4fc]/70 line-clamp-1 mt-0.5">
                        {card.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
