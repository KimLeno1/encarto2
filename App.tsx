import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  User as UserIcon, 
  Bell, 
  CreditCard, 
  ChevronDown, 
  LayoutGrid, 
  X, 
  Ticket as TicketIcon, 
  ShoppingBasket, 
  LogOut, 
  Settings, 
  Wallet,
  Calendar,
  QrCode,
  ShoppingBag,
  Truck,
  ExternalLink,
  Trophy,
  Users,
  Store,
  Newspaper,
  MonitorPlay,
  BookOpen,
  MessageSquare,
  Swords,
  Info,
  ShieldCheck,
  CalendarDays,
  Medal,
  Laptop,
  Smartphone,
  Cpu,
  Zap
} from 'lucide-react';
import { PlayerProfile, PanelType, AnimeTheme, Team, Notification, ShopItem, Ticket, Tournament, GameCardItem } from './types.ts';
import { INITIAL_PROFILE, MOCK_TEAMS, MOCK_NOTIFICATIONS, MOCK_TICKETS, MOCK_ORDERS, UPCOMING_TOURNAMENTS, SHOP_ITEMS, MOCK_STREAMS, BLOG_POSTS, MATCH_FIXTURES, MOCK_HALL_OF_FAME } from './mockData.ts';
import { LogoComponent, NavButton, DropdownItem, MoreMenuItem, SectionLoader } from './components.tsx';
import LobbyPanel from './LobbyPanel.tsx';
import TeamsPanel from './TeamsPanel.tsx';
import NotificationsPanel from './NotificationsPanel.tsx';
import ProfilePanel, { getDecorationClass } from './ProfilePanel.tsx';
import TournamentsPanel from './TournamentsPanel.tsx';
import StorePanel from './StorePanel.tsx';
import EncyclopediaPanel from './EncyclopediaPanel.tsx';
import HallOfFamePanel from './HallOfFamePanel.tsx';
import AuthPanel from './AuthPanel.tsx';
import ChatPanel from './ChatPanel.tsx';
import PvPPanel from './PvPPanel.tsx';
import AboutPanel from './AboutPanel.tsx';
import OrganizerPanel from './OrganizerPanel.tsx';
import StreamingPanel from './StreamingPanel.tsx';
import BlogPanel from './BlogPanel.tsx';
import FixturesPanel from './FixturesPanel.tsx';
import LandingPanel from './LandingPanel.tsx';
import SystemAdminPanel from './admin/SystemAdminPanel.tsx';
import { api } from './apiClient.ts';
import { EncartoArena } from './game/EncartoArena.tsx';
import { ArenaGameHub } from './ArenaGameHub.tsx';
import { StardustBackground } from './StardustBackground.tsx';
import { AnimatedBalance } from './AnimatedBalance.tsx';
import { MobileNav } from './MobileNav.tsx';
import { DesktopSidebar } from './DesktopSidebar.tsx';
import { DigitalPasses } from './DigitalPasses.tsx';

const DEFAULT_PLACEHOLDER_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoVeteran';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>(PanelType.MAIN);
  const [theme, setTheme] = useState<AnimeTheme>('mha');
  const [profile, setProfile] = useState<PlayerProfile>({ ...INITIAL_PROFILE, isSystemAdmin: true });
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [tournaments, setTournaments] = useState<Tournament[]>(UPCOMING_TOURNAMENTS);
  
  // Device mode & auto-detection state
  const [deviceMode, setDeviceMode] = useState<'auto' | 'desktop' | 'mobile'>('auto');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [notifFilter, setNotifFilter] = useState<'all' | 'system' | 'admin' | 'user'>('all');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showHeaderNotifications, setShowHeaderNotifications] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState<Record<string, boolean>>({});
  const [adminBackdoor, setAdminBackdoor] = useState(false);
  
  const [editFields, setEditFields] = useState({ ...profile, password: '', selectedTheme: theme });
  const [profileTab, setProfileTab] = useState<'identity' | 'progression' | 'account' | 'style' | 'wallet' | 'armory'>('identity');

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamData, setNewTeamData] = useState({ name: '', about: '', info: '', image: '' });

  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const headerNotificationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropperImageRef = useRef<HTMLImageElement>(null);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Window resize listener for auto-detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDetectedMobile = windowWidth < 768;
  const activeIsMobile = deviceMode === 'mobile' || (deviceMode === 'auto' && isDetectedMobile);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res.user) {
        const u = res.user;
        const loadedProfile: PlayerProfile = {
          id: u.id,
          name: u.username,
          email: u.email,
          rank: u.rank ?? 1,
          exp: u.exp ?? 0,
          balance: Number(u.balance ?? 0),
          avatar: u.avatarUrl || DEFAULT_PLACEHOLDER_AVATAR,
          badges: INITIAL_PROFILE.badges,
          phone: u.profile?.phone || '',
          birthday: u.profile?.birthday || '',
          team: INITIAL_PROFILE.team,
          bio: u.bio || '',
          ownedItems: u.ownedItems || [],
          role: u.role,
          isSystemAdmin: u.role === 'ADMIN',
          activePlugin: u.profile?.activePlugin || undefined,
          activeDecoration: u.profile?.activeDecoration || undefined,
        };
        setProfile(loadedProfile);
        if (u.profile?.selectedTheme) {
          setTheme(u.profile.selectedTheme as AnimeTheme);
        }
        setEditFields({
          ...loadedProfile,
          password: '',
          selectedTheme: (u.profile?.selectedTheme as AnimeTheme) || theme,
        });
        setIsLoggedIn(true);
      }
    });
  }, []);

  useEffect(() => {
    // Ensure active and upcoming tournaments remain populated for players
    setTournaments(prev => (prev && prev.length > 0 ? prev : UPCOMING_TOURNAMENTS));
  }, []);

  useEffect(() => {
    const panelsWithLoading: PanelType[] = [PanelType.STORE, PanelType.TOURNAMENTS, PanelType.ADMIN, PanelType.TEAMS, PanelType.NOTIFICATIONS, PanelType.HALL_OF_FAME, PanelType.CHAT, PanelType.PVP, PanelType.ABOUT, PanelType.ORGANIZER, PanelType.STREAMING, PanelType.BLOG, PanelType.FIXTURES, PanelType.SYSTEM_ADMIN];
    if (panelsWithLoading.includes(activePanel)) {
      setLoadingPanels(prev => ({ ...prev, [activePanel]: true }));
      const timer = setTimeout(() => {
        setLoadingPanels(prev => ({ ...prev, [activePanel]: false }));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activePanel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowDropdown(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) setShowMoreMenu(false);
      if (headerNotificationRef.current && !headerNotificationRef.current.contains(event.target as Node)) setShowHeaderNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthSuccess = (userData: any) => {
    if (userData.username) {
      const newProfile: PlayerProfile = {
        ...profile,
        id: userData.id,
        name: userData.username,
        email: userData.email,
        rank: userData.rank ?? profile.rank,
        exp: userData.exp ?? profile.exp,
        balance: Number(userData.balance ?? profile.balance),
        birthday: userData.profile?.birthday || userData.birthday || profile.birthday,
        avatar: userData.avatarUrl || userData.profilePic || profile.avatar,
        bio: userData.bio || profile.bio,
        role: userData.role || 'USER',
        isSystemAdmin: userData.role === 'ADMIN',
      };
      setProfile(newProfile);
      setEditFields({ ...newProfile, password: '', selectedTheme: theme });
    }
    setIsLoggedIn(true);
    setShowAuth(false);
    if (adminBackdoor) {
      if (userData.role === 'ADMIN') {
        setActivePanel(PanelType.SYSTEM_ADMIN);
      }
      setAdminBackdoor(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const { selectedTheme, ...restProfile } = editFields;
      if (profile.id) {
        await api.updateProfile(profile.id, {
          username: restProfile.name,
          email: restProfile.email,
          bio: restProfile.bio,
          avatarUrl: restProfile.avatar,
          phone: restProfile.phone,
          birthday: restProfile.birthday,
          selectedTheme: selectedTheme,
          activePlugin: profile.activePlugin,
          activeDecoration: profile.activeDecoration,
          ...(editFields.password ? { newPassword: editFields.password } : {}),
        });
      }
      setProfile(prev => ({ ...prev, ...restProfile }));
      setTheme(selectedTheme as AnimeTheme);
    } catch (err) {
      console.error('Failed to sync profile with server:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Invalid file format. Only images are permitted for avatar upload.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditFields(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsLoggedIn(false);
    setShowDropdown(false);
  };

  const handleSwitchDemo = async () => {
    const targetRole = profile.role === 'ADMIN' ? 'pilot' : 'admin';
    try {
      const res = await api.loginDemo(targetRole);
      if (res.user) {
        handleAuthSuccess(res.user);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('Failed to switch demo account:', err);
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (profile.ownedItems.includes(item.id)) {
      alert('You already own this item.');
      return;
    }
    if (profile.balance < item.price) {
      alert("Insufficient M3GA coins!");
      return;
    }
    setProfile(prev => ({
      ...prev,
      balance: prev.balance - item.price,
      ownedItems: [...prev.ownedItems, item.id]
    }));
    if (item.type === 'theme' && item.themeKey) {
      setTheme(item.themeKey);
      setEditFields(prev => ({ ...prev, selectedTheme: item.themeKey! }));
      if (profile.id) {
        api.updateProfile(profile.id, { selectedTheme: item.themeKey }).catch(err => {
          console.error('Failed to save selected theme:', err);
        });
      }
    }
    alert(`Successfully acquired ${item.name}!`);
  };

  const handleEquipTheme = (item: ShopItem) => {
    if (item.type !== 'theme' || !item.themeKey || !profile.ownedItems.includes(item.id)) return;
    setTheme(item.themeKey);
    setEditFields(prev => ({ ...prev, selectedTheme: item.themeKey! }));
    if (profile.id) {
      api.updateProfile(profile.id, { selectedTheme: item.themeKey }).catch(err => {
        console.error('Failed to save selected theme:', err);
      });
    }
  };

  const handleRegisterTournament = (tournament: Tournament) => {
    if (profile.balance < tournament.entryFee) {
      alert("Insufficient M3GA coins for entry fee!");
      return;
    }
    if (tournament.registeredPlayers.length >= tournament.maxPlayers) {
      alert("Deployment failed: Tournament slots are at maximum capacity.");
      return;
    }
    const ticketId = `ENC-${tournament.id}-${Math.floor(Math.random() * 9000) + 1000}`;
    const newTicket: Ticket = {
      id: ticketId,
      tournamentName: tournament.name,
      date: tournament.date,
      status: 'confirmed',
      price: tournament.entryFee,
      qrCode: ticketId
    };
    setTickets(prev => [...prev, newTicket]);
    setTournaments(prev => prev.map(t => 
      t.id === tournament.id 
        ? { ...t, registeredPlayers: [...t.registeredPlayers, profile.name] } 
        : t
    ));
    setProfile(prev => ({ ...prev, balance: prev.balance - tournament.entryFee }));
    const newNotification: Notification = {
      id: `n-${Date.now()}`,
      userId: profile.name,
      message: `You successfully registered for ${tournament.name}! Your ticket code is ${ticketId}`,
      type: 'success',
      category: 'system',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newTicket;
  };

  const handlePlayGame = (game: GameCardItem) => {
    if (game.playableType === 'arena' || game.playableType === 'chess' || game.playableType === 'racing' || game.playableType === 'bike' || game.playableType === 'checkers') {
      setActivePanel(PanelType.ARENA);
    } else {
      setActivePanel(PanelType.TOURNAMENTS);
    }
  };

  const handleClaimQuestReward = (questId: string, reward: number, xp: number) => {
    setProfile(prev => ({
      ...prev,
      balance: prev.balance + reward,
      exp: prev.exp + xp,
    }));
    const newNotification: Notification = {
      id: `quest-${Date.now()}`,
      userId: profile.name,
      message: `Quest reward claimed! Received +${reward} M3GA coins and +${xp} XP.`,
      type: 'success',
      category: 'system',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleCreateTeam = () => {
    if (!newTeamData.name || !newTeamData.about) return;
    const teamId = `team-${Date.now()}`;
    const createdTeam: Team = {
      id: teamId,
      name: newTeamData.name,
      about: newTeamData.about,
      info: newTeamData.info || "Newly established Encarto squad.",
      image: newTeamData.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400",
      leaderId: profile.name,
      members: [profile.name],
      memberCount: 1,
      joinRequests: []
    };
    setTeams([...teams, createdTeam]);
    setProfile({ ...profile, teamId: teamId, isLeader: true, team: createdTeam.name });
    setIsCreatingTeam(false);
    setNewTeamData({ name: '', about: '', info: '', image: '' });
  };

  const handleRequestToJoin = (teamId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId && !t.joinRequests.includes(profile.name)
        ? { ...t, joinRequests: [...t.joinRequests, profile.name] } 
        : t
    ));
    alert("Join request transmitted.");
  };

  const handleActionOnRequest = (teamId: string, requester: string, action: 'accept' | 'decline') => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const updatedRequests = t.joinRequests.filter(r => r !== requester);
        if (action === 'accept') {
          return {
            ...t,
            members: [...t.members, requester],
            memberCount: t.memberCount + 1,
            joinRequests: updatedRequests
          };
        }
        return { ...t, joinRequests: updatedRequests };
      }
      return t;
    }));
  };

  if (!isLoggedIn) {
    if (showAuth) {
      return (
        <AuthPanel 
          onAuthSuccess={handleAuthSuccess} 
          onCancel={() => setShowAuth(false)} 
        />
      );
    }
    return (
      <LandingPanel 
        onEnter={() => setShowAuth(true)} 
        onAdminAccess={() => { 
          setAdminBackdoor(true);
          setShowAuth(true);
        }} 
        onDemoLogin={async (role = 'player') => {
          try {
            const res = await api.loginDemo(role === 'admin' ? 'admin' : 'pilot');
            if (res.user) {
              handleAuthSuccess(res.user);
            }
          } catch (e) {
            console.error('Demo login error:', e);
          }
        }}
      />
    );
  }

  const morePanels: PanelType[] = [PanelType.TOURNAMENTS, PanelType.FIXTURES, PanelType.STREAMING, PanelType.BLOG, PanelType.STORE, PanelType.TICKETS, PanelType.ORDERS, PanelType.TEAMS, PanelType.NOTIFICATIONS, PanelType.HALL_OF_FAME, PanelType.CHAT, PanelType.PVP, PanelType.ABOUT, PanelType.ORGANIZER, PanelType.SYSTEM_ADMIN];
  const isMoreActive = morePanels.includes(activePanel);
  const myTeam = profile.teamId ? teams.find(t => t.id === profile.teamId) || null : null;
  const hasOrganizerRole = profile.ownedItems.includes('role-organizer');

  const handleMobileTabSelect = (tab: 'arena' | 'tournaments' | 'squad' | 'wallet' | 'more') => {
    if (tab === 'arena') {
      setActivePanel(PanelType.ARENA);
      setShowMoreMenu(false);
    } else if (tab === 'tournaments') {
      setActivePanel(PanelType.TOURNAMENTS);
      setShowMoreMenu(false);
    } else if (tab === 'squad') {
      setActivePanel(PanelType.TEAMS);
      setShowMoreMenu(false);
    } else if (tab === 'wallet') {
      setActivePanel(PanelType.ADMIN);
      setProfileTab('wallet');
      setShowMoreMenu(false);
    } else if (tab === 'more') {
      setShowMoreMenu(prev => !prev);
    }
  };

  const handleSelectPanel = (panel: PanelType, tab?: any) => {
    setActivePanel(panel);
    if (tab) setProfileTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-gradient-to-b from-[#07051a] via-[#0b0b2b] to-[#07051a] text-[#f5f3ff] ${activeIsMobile ? 'mobile-viewport-shell' : 'desktop-viewport-shell'} relative`}>
      {/* Ambient Twinkling Stardust Background */}
      <StardustBackground />
      
      {/* Top Navigation Bar with Glowing Light Purple / Neon Blue Esports Vibe */}
      <header className={`px-4 sm:px-6 py-2.5 flex justify-between items-center glass-panel sticky top-0 z-[120] border-b border-purple-500/25 bg-[#0b0b2b]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(7,5,26,0.8)]`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActivePanel(PanelType.MAIN)}>
          <LogoComponent />
          <div>
            <h1 className="anime-title text-xl sm:text-2xl tracking-wider uppercase flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-200 to-cyan-300 drop-shadow-[0_0_15px_rgba(192,132,252,0.7)]">
                ENCARTO
              </span> 
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/90 text-cyan-300 border border-purple-400/50 shadow-[0_0_12px_rgba(192,132,252,0.5)]">
                ESPORTS OS
              </span>
            </h1>
          </div>
        </div>

        {/* Center / Right Control Cluster */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          
          {/* Device Layout Mode Selector (Desktop / Mobile / Auto) */}
          <div className="hidden lg:flex items-center bg-[#070518]/90 p-1 rounded-xl border border-purple-500/30 text-xs font-bold shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
            <button 
              onClick={() => setDeviceMode('auto')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'auto' 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.5)]' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Auto-detects based on screen width"
            >
              <Cpu size={13} className="text-cyan-300" />
              <span>Auto ({isDetectedMobile ? 'Mobile' : 'Desktop'})</span>
            </button>
            <button 
              onClick={() => setDeviceMode('desktop')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'desktop' 
                  ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_14px_rgba(6,182,212,0.6)]' 
                  : 'text-zinc-400 hover:text-cyan-300'
              }`}
            >
              <Laptop size={13} />
              <span>Desktop</span>
            </button>
            <button 
              onClick={() => setDeviceMode('mobile')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceMode === 'mobile' 
                  ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_14px_rgba(168,85,247,0.6)]' 
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <Smartphone size={13} />
              <span>Mobile UI</span>
            </button>
          </div>

          {/* M3GA Coin Balance with animated count-up when it changes */}
          <AnimatedBalance 
            balance={profile.balance} 
            onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('wallet'); }} 
          />

          {/* Hall of Fame quick button */}
          <button 
            onClick={() => setActivePanel(PanelType.HALL_OF_FAME)}
            className={`p-2 rounded-full border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              activePanel === PanelType.HALL_OF_FAME 
                ? 'bg-purple-600/80 border-purple-400 text-cyan-200 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                : 'bg-purple-950/40 border-purple-500/25 text-purple-300 hover:text-cyan-200 hover:border-cyan-400/50'
            }`}
            title="Hall of Fame"
          >
            <BookOpen size={18} />
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={headerNotificationRef}>
            <button 
              onClick={() => setShowHeaderNotifications(!showHeaderNotifications)} 
              className="p-2 bg-purple-950/40 rounded-full border border-purple-500/25 hover:border-cyan-400/40 hover:bg-purple-900/40 transition-all relative cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell size={18} className="text-purple-300 hover:text-cyan-300" />
              {unreadNotificationsCount > 0 && (
                <div className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full border-2 border-[#07051a] flex items-center justify-center px-1 shadow-[0_0_8px_rgba(56,189,248,0.8)]">
                   <span className="text-[9px] font-black text-white">{unreadNotificationsCount}</span>
                </div>
              )}
            </button>
            {showHeaderNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl border border-purple-500/40 shadow-2xl py-2 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[130]">
                <div className="px-4 py-2 border-b border-purple-500/20 mb-1 flex justify-between items-center">
                  <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Recent Activity</p>
                  <button onClick={() => { setActivePanel(PanelType.NOTIFICATIONS); setShowHeaderNotifications(false); }} className="text-[8px] font-black text-purple-400 uppercase hover:text-white cursor-pointer">See All</button>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-purple-950/30 border-b border-purple-500/15 last:border-0 ${!n.read ? 'bg-purple-900/20' : ''}`}>
                      <p className={`text-[10px] font-bold text-white`}>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Demo Pilot / Admin Pill */}
          {profile.id?.startsWith('demo-') && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-cyan-400/40 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black text-cyan-200 tracking-wider uppercase font-mono">
                {profile.role === 'ADMIN' ? 'DEMO COMMANDER' : 'DEMO PILOT'}
              </span>
            </div>
          )}

          {/* Profile Dropdown with Glowing Ring Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="flex items-center gap-1.5 group p-0.5 rounded-full hover:bg-purple-950/40 transition-all cursor-pointer min-h-[44px]"
            >
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#a855f7] to-[#3b82f6] ring-2 ring-[#a855f7] shadow-[0_0_16px_#c084fc] group-hover:shadow-[0_0_24px_#c084fc] overflow-hidden flex items-center justify-center transition-all duration-300">
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
              <ChevronDown size={14} className={`text-purple-300 group-hover:text-cyan-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-purple-500/40 shadow-2xl py-2 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[130]">
                {profile.id?.startsWith('demo-') && (
                  <>
                    <div className="px-4 py-1.5 border-b border-purple-500/20 bg-cyan-950/30 flex items-center justify-between">
                      <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">
                        {profile.role === 'ADMIN' ? 'Commander (Admin)' : 'Pilot (Player)'}
                      </span>
                      <span className="text-[8px] font-bold text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-500/20">DEMO</span>
                    </div>
                    <DropdownItem 
                      icon={<Zap size={16} />} 
                      label={`Switch to ${profile.role === 'ADMIN' ? 'Pilot (Player)' : 'Commander (Admin)'}`} 
                      onClick={handleSwitchDemo} 
                      color="text-cyan-300" 
                    />
                    <div className="h-px bg-purple-500/20 my-1" />
                  </>
                )}
                <div className="px-4 py-2 border-b border-purple-500/20 mb-1">
                  <p className="text-[9px] font-black text-cyan-300 uppercase tracking-[0.2em]">Management</p>
                </div>
                <DropdownItem icon={<UserIcon size={16} />} label="Profile Settings" onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('identity'); setShowDropdown(false); }} />
                <DropdownItem icon={<Settings size={16} />} label="Account Management" onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('account'); setShowDropdown(false); }} />
                <DropdownItem icon={<Wallet size={16} />} label="Wallet & Billing" onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('wallet'); setShowDropdown(false); }} />
                <div className="h-px bg-purple-500/20 my-1" />
                <DropdownItem icon={<Info size={16} />} label="About Encarto" onClick={() => { setActivePanel(PanelType.ABOUT); setShowDropdown(false); }} />
                <DropdownItem icon={<TicketIcon size={16} />} label="Passes" onClick={() => { setActivePanel(PanelType.TICKETS); setShowDropdown(false); }} />
                <DropdownItem icon={<ShoppingBag size={16} />} label="Orders" onClick={() => { setActivePanel(PanelType.ORDERS); setShowDropdown(false); }} />
                <div className="h-px bg-purple-500/20 my-1" />
                <DropdownItem icon={<LogOut size={16} />} label="Logout" onClick={handleLogout} color="text-rose-400" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Desktop Sidebar on Left + Content Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar Rail (72px expanding to 240px with labels on hover) */}
        {!activeIsMobile && (
          <DesktopSidebar 
            activePanel={activePanel} 
            profileTab={profileTab} 
            onSelectPanel={handleSelectPanel} 
            profile={profile} 
            hasOrganizerRole={hasOrganizerRole} 
          />
        )}

        {/* Main Content Viewport */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${
          activeIsMobile 
            ? 'max-w-md mx-auto w-full px-4 pt-4 pb-28' 
            : 'w-full px-6 py-6 pb-16 max-w-7xl mx-auto'
        }`}>
          {/* Mobile View Indicator Banner if manually forced */}
          {deviceMode !== 'auto' && (
            <div className="mb-4 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-between text-xs text-violet-300">
              <span>Viewing in <strong>{deviceMode.toUpperCase()}</strong> mode (Auto-detect is available).</span>
              <button onClick={() => setDeviceMode('auto')} className="underline font-bold hover:text-white cursor-pointer">Reset to Auto</button>
            </div>
          )}

          {/* Page transition: 200ms fade plus 12px slide-up between sections */}
          <div key={activePanel} className="page-transition-enter w-full">

        {activePanel === PanelType.MAIN && (
          <LobbyPanel 
            profile={profile} 
            myTeam={myTeam} 
            upcomingTournaments={tournaments} 
            hallOfFame={MOCK_HALL_OF_FAME}
            blogPosts={BLOG_POSTS}
            fixtures={MATCH_FIXTURES}
            shopItems={SHOP_ITEMS}
            streams={MOCK_STREAMS}
            tickets={tickets}
            onPanelChange={setActivePanel} 
            onWalletTab={() => { setActivePanel(PanelType.ADMIN); setProfileTab('wallet'); }} 
            onRegisterTournament={handleRegisterTournament}
            onPlayGame={handlePlayGame}
            onClaimQuestReward={handleClaimQuestReward}
          />
        )}
        {activePanel === PanelType.TEAMS && <TeamsPanel myTeam={myTeam} profile={profile} teams={teams} teamSearchQuery={teamSearchQuery} setTeamSearchQuery={setTeamSearchQuery} isCreatingTeam={isCreatingTeam} setIsCreatingTeam={setIsCreatingTeam} newTeamData={newTeamData} setNewTeamData={setNewTeamData} handleCreateTeam={handleCreateTeam} handleRequestToJoin={handleRequestToJoin} handleActionOnRequest={handleActionOnRequest} />}
        {activePanel === PanelType.NOTIFICATIONS && <NotificationsPanel notifications={notifications} notifFilter={notifFilter} setNotifFilter={setNotifFilter} markAllRead={() => {}} deleteNotification={() => {}} />}
        {activePanel === PanelType.ADMIN && (
          <ProfilePanel 
            profile={profile} 
            setProfile={setProfile}
            editFields={editFields} 
            setEditFields={setEditFields} 
            profileTab={profileTab} 
            setProfileTab={setProfileTab} 
            isUpdatingProfile={isUpdatingProfile} 
            handleSaveProfile={handleSaveProfile} 
            onAvatarClick={() => fileInputRef.current?.click()} 
            onDeposit={() => {}} 
            onWithdraw={() => {}} 
            activeTheme={theme}
            setTheme={setTheme}
          />
        )}
        {activePanel === PanelType.TOURNAMENTS && (
          loadingPanels[PanelType.TOURNAMENTS] ? <SectionLoader message="Scanning Arena Records..." /> : 
          <TournamentsPanel tournaments={tournaments} onRegister={handleRegisterTournament} tickets={tickets} profile={profile} />
        )}
        {activePanel === PanelType.STORE && (
          loadingPanels[PanelType.STORE] ? <SectionLoader message="Opening Armory Vault..." /> : 
          <StorePanel items={SHOP_ITEMS} profile={profile} onPurchase={handlePurchase} onEquip={handleEquipTheme} />
        )}
        {activePanel === PanelType.HALL_OF_FAME && (
          loadingPanels[PanelType.HALL_OF_FAME] ? <SectionLoader message="Recalling Legends..." /> : 
          <HallOfFamePanel />
        )}
        {activePanel === PanelType.CHAT && <ChatPanel profile={profile} myTeam={myTeam} />}
        {activePanel === PanelType.PVP && <PvPPanel profile={profile} />}
        {activePanel === PanelType.ARENA && (
          <ArenaGameHub
            profile={profile}
            onBackToMain={() => setActivePanel(PanelType.MAIN)}
          />
        )}
        {activePanel === PanelType.ABOUT && <AboutPanel />}
        {activePanel === PanelType.ORGANIZER && hasOrganizerRole && <OrganizerPanel profile={profile} />}
        {activePanel === PanelType.STREAMING && <StreamingPanel streams={MOCK_STREAMS} />}
        {activePanel === PanelType.BLOG && <BlogPanel posts={BLOG_POSTS} />}
        {activePanel === PanelType.FIXTURES && <FixturesPanel fixtures={MATCH_FIXTURES} profile={profile} />}
        {activePanel === PanelType.SYSTEM_ADMIN && profile.isSystemAdmin && <SystemAdminPanel />}

        {activePanel === PanelType.TICKETS && (
          loadingPanels[PanelType.TICKETS] ? <SectionLoader message="Validating Deployment Clearances..." /> :
          <div className="max-w-6xl mx-auto pb-12">
            <DigitalPasses tickets={tickets} />
          </div>
        )}

        {activePanel === PanelType.ORDERS && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="anime-title text-4xl text-white uppercase tracking-tight">Gear Orders</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Tracking your merchandise deliveries</p>
              </div>
            </header>
            <div className="space-y-6">
              {MOCK_ORDERS.map(order => (
                <div key={order.id} className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 shadow-inner">
                      <ShoppingBag size={32} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">{order.itemName}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.id}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="flex flex-col items-center md:items-end">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest bg-blue-500/10 border-blue-500/20 text-blue-500">
                        <Truck size={10}/>{order.status}
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end min-w-[100px]">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price</p>
                      <span className="text-xl font-black text-white uppercase font-mono tabular-nums">{order.price} <span className="text-[10px] text-primary">M3GA</span></span>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
                      <ExternalLink size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </div>
        </main>
      </div>

      {/* Floating Bottom Tab Bar on Mobile (under 768px or activeIsMobile) */}
      {activeIsMobile && (
        <MobileNav 
          activePanel={activePanel}
          profileTab={profileTab}
          onSelectTab={handleMobileTabSelect}
          onSelectPanel={handleSelectPanel}
          showMoreSheet={showMoreMenu}
          setShowMoreSheet={setShowMoreMenu}
          profile={profile}
          hasOrganizerRole={hasOrganizerRole}
        />
      )}

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
    </div>
  );
};

export default App;
