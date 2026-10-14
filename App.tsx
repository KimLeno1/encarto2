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
  Cpu
} from 'lucide-react';
import { PlayerProfile, PanelType, AnimeTheme, Team, Notification, ShopItem, Ticket, Tournament } from './types.ts';
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    setTournaments(prev => prev.filter(t => {
      const tourneyDate = new Date(t.date);
      tourneyDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - tourneyDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1;
    }));
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
      return <AuthPanel onAuthSuccess={handleAuthSuccess} />;
    }
    return (
      <LandingPanel 
        onEnter={() => setShowAuth(true)} 
        onAdminAccess={() => { 
          setAdminBackdoor(true);
          setShowAuth(true);
        }} 
      />
    );
  }

  const morePanels: PanelType[] = [PanelType.TOURNAMENTS, PanelType.FIXTURES, PanelType.STREAMING, PanelType.BLOG, PanelType.STORE, PanelType.TICKETS, PanelType.ORDERS, PanelType.TEAMS, PanelType.NOTIFICATIONS, PanelType.HALL_OF_FAME, PanelType.CHAT, PanelType.PVP, PanelType.ABOUT, PanelType.ORGANIZER, PanelType.SYSTEM_ADMIN];
  const isMoreActive = morePanels.includes(activePanel);
  const myTeam = profile.teamId ? teams.find(t => t.id === profile.teamId) || null : null;
  const hasOrganizerRole = profile.ownedItems.includes('role-organizer');

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-[#070711] ${activeIsMobile ? 'mobile-viewport-shell' : 'desktop-viewport-shell'}`}>
      
      {/* Top Navigation Bar with Device Layout Selector & Auto-Detection Status */}
      <header className={`px-6 py-3.5 flex justify-between items-center glass-panel sticky top-0 z-[100] border-b border-white/10 ${activeIsMobile ? 'px-4' : 'px-8'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePanel(PanelType.MAIN)}>
          <LogoComponent />
          <div>
            <h1 className="anime-title text-2xl tracking-wider text-white uppercase flex items-center gap-2">
              ENCARTO <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">ESPORTS OS</span>
            </h1>
          </div>
        </div>

        {/* Center / Right Control Cluster */}
        <div className="flex items-center gap-4">
          
          {/* Device Layout Mode Selector (Desktop / Mobile / Auto) */}
          <div className="hidden md:flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button 
              onClick={() => setDeviceMode('auto')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${deviceMode === 'auto' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              title="Auto-detects based on screen width"
            >
              <Cpu size={14} />
              <span>Auto ({isDetectedMobile ? 'Mobile' : 'Desktop'})</span>
            </button>
            <button 
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${deviceMode === 'desktop' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Laptop size={14} />
              <span>Desktop</span>
            </button>
            <button 
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${deviceMode === 'mobile' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Smartphone size={14} />
              <span>Mobile UI</span>
            </button>
          </div>

          <button 
            onClick={() => setActivePanel(PanelType.HALL_OF_FAME)}
            className={`p-2.5 rounded-full border transition-all ${activePanel === PanelType.HALL_OF_FAME ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            title="Hall of Fame"
          >
            <BookOpen size={18} />
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={headerNotificationRef}>
            <button onClick={() => setShowHeaderNotifications(!showHeaderNotifications)} className="p-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all relative">
              <Bell size={18} className="text-gray-400" />
              {unreadNotificationsCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-black flex items-center justify-center px-1">
                   <span className="text-[9px] font-black text-white">{unreadNotificationsCount}</span>
                </div>
              )}
            </button>
            {showHeaderNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl border border-white/10 shadow-2xl py-2 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[120]">
                <div className="px-4 py-2 border-b border-white/5 mb-1 flex justify-between items-center">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recent Activity</p>
                  <button onClick={() => { setActivePanel(PanelType.NOTIFICATIONS); setShowHeaderNotifications(false); }} className="text-[8px] font-black text-gray-500 uppercase hover:text-white">See All</button>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
                      <p className={`text-[10px] font-bold text-white`}>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Balance Pill */}
          <button onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('wallet'); }} className="hidden sm:flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
            <CreditCard className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold font-mono tabular-nums">{profile.balance.toFixed(2)} <span className="text-[10px] text-gray-400 uppercase">m3ga</span></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 group p-0.5 rounded-full hover:bg-white/5 transition-all">
              <div className={`w-9 h-9 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all duration-500 ${getDecorationClass(profile.activeDecoration).replace('border-4 p-1.5', 'border-2')}`}>
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
              <ChevronDown size={14} className={`text-gray-400 group-hover:text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-white/10 shadow-2xl py-2 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[110]">
                <div className="px-4 py-2 border-b border-white/5 mb-1">
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Management</p>
                </div>
                <DropdownItem icon={<UserIcon size={16} />} label="Profile Settings" onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('identity'); setShowDropdown(false); }} />
                <DropdownItem icon={<Settings size={16} />} label="Account Management" onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('account'); setShowDropdown(false); }} />
                <DropdownItem icon={<Wallet size={16} />} label="Wallet & Billing" onClick={() => { setActivePanel(PanelType.ADMIN); setProfileTab('wallet'); setShowDropdown(false); }} />
                <div className="h-px bg-white/5 my-1" />
                <DropdownItem icon={<Info size={16} />} label="About Encarto" onClick={() => { setActivePanel(PanelType.ABOUT); setShowDropdown(false); }} />
                <DropdownItem icon={<TicketIcon size={16} />} label="Passes" onClick={() => { setActivePanel(PanelType.TICKETS); setShowDropdown(false); }} />
                <DropdownItem icon={<ShoppingBag size={16} />} label="Orders" onClick={() => { setActivePanel(PanelType.ORDERS); setShowDropdown(false); }} />
                <div className="h-px bg-white/5 my-1" />
                <DropdownItem icon={<LogOut size={16} />} label="Logout" onClick={handleLogout} color="text-red-400" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport (Adapts styling for desktop vs mobile touch interface) */}
      <main className={`flex-grow overflow-y-auto pb-28 px-4 pt-6 custom-scrollbar ${activeIsMobile ? 'max-w-md mx-auto w-full' : 'max-w-7xl mx-auto w-full'}`}>
        
        {/* Mobile View Indicator Banner if manually forced */}
        {deviceMode !== 'auto' && (
          <div className="mb-4 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-between text-xs text-violet-300">
            <span>Viewing in <strong>{deviceMode.toUpperCase()}</strong> mode (Auto-detect is available).</span>
            <button onClick={() => setDeviceMode('auto')} className="underline font-bold hover:text-white">Reset to Auto</button>
          </div>
        )}

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
            onPanelChange={setActivePanel} 
            onWalletTab={() => { setActivePanel(PanelType.ADMIN); setProfileTab('wallet'); }} 
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
          <EncartoArena
            onBackToHub={() => setActivePanel(PanelType.MAIN)}
            playerName={profile.name}
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
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="anime-title text-4xl text-white uppercase tracking-tight">Access Passes</h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Your keys to the arena</p>
              </div>
            </header>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tickets.map(ticket => (
                <div key={ticket.id} className="relative group perspective-1000">
                  <div className="glass-panel rounded-[2rem] border-2 border-white/5 p-8 flex flex-col h-full bg-gradient-to-br from-white/[0.03] to-transparent group-hover:border-primary/40 transition-all duration-500 shadow-2xl overflow-hidden">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-black rounded-full shadow-inner"/>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-black rounded-full shadow-inner"/>
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/5"/>
                    <div className="mb-12">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-green-500/20 text-green-400">{ticket.status}</span>
                        <span className="text-[8px] font-black text-gray-500 uppercase">{ticket.id}</span>
                      </div>
                      <h4 className="text-2xl font-black text-white uppercase leading-tight mb-2">{ticket.tournamentName}</h4>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={12}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">{ticket.date}</span>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-col items-center">
                      <div className="p-4 bg-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                        <QrCode size={120} className="text-black" />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">{ticket.qrCode}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      </main>

      {/* Fixed Bottom Navigation Dock (Optimized for both Desktop and Mobile ergonomic thumb zones) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 flex justify-around items-center p-3.5 mobile-bottom-nav z-[150] shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
        <NavButton icon={<Gamepad2 />} label="Lobby" active={activePanel === PanelType.MAIN} onClick={() => { setActivePanel(PanelType.MAIN); setShowMoreMenu(false); }} />
        <NavButton icon={<Store />} label="Armory" active={activePanel === PanelType.STORE} onClick={() => { setActivePanel(PanelType.STORE); setShowMoreMenu(false); }} />
        <div className="relative" ref={moreMenuRef}>
          <NavButton icon={showMoreMenu ? <X /> : <LayoutGrid />} label="More" active={isMoreActive} onClick={() => setShowMoreMenu(!showMoreMenu)} className={showMoreMenu ? 'text-primary' : ''} />
          {showMoreMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 glass-panel rounded-[2.5rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[60vh] custom-scrollbar py-3 animate-in slide-in-from-bottom-4 fade-in duration-300 z-[160]">
              <div className="px-8 py-3 border-b border-white/5 mb-2 sticky top-0 bg-black/40 backdrop-blur-md z-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Access Systems</p>
              </div>
              <div className="px-8 pt-3 pb-1 text-[9px] font-black uppercase tracking-[0.25em] text-sky-200/80">Compete</div>
              <MoreMenuItem icon={<Swords />} label="Encarto Arena" active={activePanel === PanelType.ARENA} onClick={() => { setActivePanel(PanelType.ARENA); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<Trophy />} label="Tournaments" active={activePanel === PanelType.TOURNAMENTS} onClick={() => { setActivePanel(PanelType.TOURNAMENTS); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<CalendarDays />} label="Fixtures" active={activePanel === PanelType.FIXTURES} onClick={() => { setActivePanel(PanelType.FIXTURES); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<Swords />} label="Skill Duels" active={activePanel === PanelType.PVP} onClick={() => { setActivePanel(PanelType.PVP); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<Medal />} label="Hall of Fame" active={activePanel === PanelType.HALL_OF_FAME} onClick={() => { setActivePanel(PanelType.HALL_OF_FAME); setShowMoreMenu(false); }} />
              <div className="mx-6 my-2 border-t border-white/[.06]" />
              <div className="px-8 pt-2 pb-1 text-[9px] font-black uppercase tracking-[0.25em] text-violet-200/80">Community</div>
              <MoreMenuItem icon={<Users />} label="Squad Hub" active={activePanel === PanelType.TEAMS} onClick={() => { setActivePanel(PanelType.TEAMS); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<Newspaper />} label="News Feed" active={activePanel === PanelType.BLOG} onClick={() => { setActivePanel(PanelType.BLOG); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<MonitorPlay />} label="Stream Hub" active={activePanel === PanelType.STREAMING} onClick={() => { setActivePanel(PanelType.STREAMING); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<MessageSquare />} label="Chat Hub" active={activePanel === PanelType.CHAT} onClick={() => { setActivePanel(PanelType.CHAT); setShowMoreMenu(false); }} />
              <MoreMenuItem icon={<Bell />} label="Comms" active={activePanel === PanelType.NOTIFICATIONS} onClick={() => { setActivePanel(PanelType.NOTIFICATIONS); setShowHeaderNotifications(false); setShowMoreMenu(false); }} />
              <div className="mx-6 my-2 border-t border-white/[.06]" />
              <div className="px-8 pt-2 pb-1 text-[9px] font-black uppercase tracking-[0.25em] text-fuchsia-200/80">Platform</div>
              {hasOrganizerRole && <MoreMenuItem icon={<ShieldCheck />} label="Host Console" active={activePanel === PanelType.ORGANIZER} onClick={() => { setActivePanel(PanelType.ORGANIZER); setShowMoreMenu(false); }} />}
            </div>
          )}
        </div>
        <NavButton icon={<UserIcon />} label="Profile" active={activePanel === PanelType.ADMIN} onClick={() => { setActivePanel(PanelType.ADMIN); setShowMoreMenu(false); setProfileTab('identity'); }} />
      </nav>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
    </div>
  );
};

export default App;
