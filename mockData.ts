
import { Badge, ShopItem, Ticket, Order, Stream, Fixture, BlogPost, Team, Notification, PlayerProfile, Tournament, HallOfFameEntry } from './types.ts';

export const ALL_BADGES: Badge[] = [
  { id: 'b1', name: 'First Blood', description: 'Secured your first tournament victory.', icon: '🩸', color: 'text-red-500', unlocked: true },
  { id: 'b2', name: 'UA Trainee', description: 'Encarto academy orientation complete.', icon: '🏫', color: 'text-blue-500', unlocked: true },
  { id: 'b3', name: 'Legendary', description: 'Reach Rank 15.', icon: '🌟', color: 'text-yellow-500', unlocked: false },
  { id: 'b4', name: 'Top 10', description: 'Break into the global top 10.', icon: '🔟', color: 'text-purple-500', unlocked: true },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'team-starter-kit', name: 'Squad Founder Kit', price: 180, type: 'team', description: 'A launch pack for your first competitive squad: team banner, roster card, and recruitment listing.', requirements: { minRank: 3 } },
  { id: 'team-brand-kit', name: 'Neon Team Identity', price: 260, type: 'team', description: 'A coordinated banner and profile accent for established teams.', requirements: { minRank: 6 } },
  { id: 'team-pro-slot', name: 'Expanded Team Roster', price: 420, type: 'team', description: 'An account unlock for teams that need more room. Team creation and membership still follow platform rules.', requirements: { minRank: 10, roles: ['ORGANIZER', 'MODERATOR', 'ADMIN'] } },
  { id: 'role-organizer', name: 'Organizer Application Pass', price: 500, type: 'role', description: 'Unlocks the organizer application flow. Buying this pass does not grant elevated permissions; staff approval is required.', requirements: { minRank: 15, minAge: 18 } },
  { id: 'role-verified-captain', name: 'Captain Identity Badge', price: 220, type: 'role', description: 'A profile identity badge for team captains. It does not change your account permissions.', requirements: { minRank: 7 } },
  { id: 't1', name: 'One Piece: Grand Line', price: 10, type: 'theme', themeKey: 'onepiece', description: 'Ocean-blue surfaces with warm treasure-gold highlights.', requirements: { minRank: 1 } },
  { id: 't2', name: 'Naruto: Hidden Leaf', price: 10, type: 'theme', themeKey: 'naruto', description: 'A high-energy orange and ember palette for your dashboard.', requirements: { minRank: 1 } },
  { id: 't3', name: 'Violet Rift', price: 35, type: 'theme', themeKey: 'violet-rift', description: 'The signature premium neon-purple and electric-blue look.', requirements: { minRank: 4 } },
  { id: 't4', name: 'Cyberwave', price: 45, type: 'theme', themeKey: 'cyberwave', description: 'A high-contrast cyber-cyan palette with deep midnight surfaces.', requirements: { minRank: 5 } },
  { id: 't5', name: 'Arctic Pulse', price: 45, type: 'theme', themeKey: 'arctic-pulse', description: 'Cool ice-blue highlights and crisp, glacial surfaces.', requirements: { minRank: 5 } },
  { id: 't6', name: 'Emberstorm', price: 60, type: 'theme', themeKey: 'emberstorm', description: 'A fiery amber-red interface for players who bring the heat.', requirements: { minRank: 7 } },
  { id: 't7', name: 'Sakura Bloom', price: 60, type: 'theme', themeKey: 'sakura-bloom', description: 'A soft neon-rose and orchid palette with dark glass surfaces.', requirements: { minRank: 7 } },
  { id: 'p1', name: 'Tournament Tracker', price: 15, type: 'plugin', description: 'Keep upcoming fixtures and tournament dates close at hand.', requirements: { minRank: 1 } },
  { id: 'm1', name: 'Encarto Hoodie', price: 450, type: 'merch', description: 'Official Encarto apparel. Physical fulfilment must be confirmed at checkout.', requirements: { minRank: 2 } },
  { id: 'm2', name: 'Arena Desk Mat', price: 300, type: 'merch', description: 'A wide desk mat for your setup. Availability and shipping are confirmed separately.', requirements: { minRank: 3 } },
  { id: 'd1', name: 'Neon Plasma Border', price: 20, type: 'decoration', description: 'A vivid neon frame for your player identity.', requirements: { minRank: 1 } },
  { id: 'd2', name: 'Golden Aura', price: 50, type: 'decoration', description: 'A warm gold profile aura for standout players.', requirements: { minRank: 5 } },
  { id: 'd3', name: 'Cyber Crown', price: 120, type: 'decoration', description: 'An animated-style crown treatment for veteran profiles.', requirements: { minRank: 10 } },
  { id: 'p2', name: 'Match Analyzer', price: 90, type: 'plugin', description: 'A match review utility for players and team staff.', requirements: { minRank: 6, roles: ['USER', 'MODERATOR', 'ORGANIZER', 'ADMIN'] } },
  { id: 'p3', name: 'Team Strategy Board', price: 160, type: 'plugin', description: 'A planning utility reserved for team leaders and organizers.', requirements: { minRank: 8, roles: ['ORGANIZER', 'MODERATOR', 'ADMIN'] } },
];

export const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Casper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
];

export const INITIAL_PROFILE: PlayerProfile = {
  name: "DekuMaster",
  rank: 15, 
  exp: 15000,
  balance: 1200.00,
  avatar: AVATAR_OPTIONS[0],
  badges: ALL_BADGES.filter(b => b.unlocked),
  email: "deku.master@encarto.com",
  phone: "+1 (555) 123-4567",
  birthday: "1995-05-20",
  team: "Plus Ultra Gamers",
  bio: "Aspiring to be the #1 hero in the gaming arena. I never give up!",
  ownedItems: ['p1', 'd1'],
  activePlugin: 'p1',
  activeDecoration: 'd1',
  teamId: undefined,
  isLeader: false
};

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: "Straw Hat Alliance",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400",
    about: "A crew sailing for the ultimate treasure: Global Rank 15.",
    info: "Global Rank: Top 5 | Focused on One Piece Clash",
    leaderId: "LuffyKing",
    members: ["LuffyKing", "ZoroSlash", "NamiWeather"],
    memberCount: 3,
    joinRequests: ["SanjiCook"]
  },
  {
    id: 'team-2',
    name: "Hidden Leaf Ninjas",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400",
    about: "Our ninja way is to never lose a fixture.",
    info: "Global Rank: Top 20 | Focused on Naruto Storm",
    leaderId: "NarutoHokage",
    members: ["NarutoHokage", "SasukeShadow"],
    memberCount: 2,
    joinRequests: []
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'DekuMaster', message: 'The UA Sports Festival tournament starts in 2 hours!', type: 'info', category: 'system', timestamp: '2h ago', read: false },
  { id: 'n2', userId: 'DekuMaster', message: 'Admin: Your profile decoration "Neon Plasma Border" was successfully validated.', type: 'success', category: 'admin', sender: 'System Admin', timestamp: '5h ago', read: true },
  { id: 'n3', userId: 'DekuMaster', message: 'BakugoBoom: Get ready to lose in the next fixture, nerd!', type: 'primary', category: 'user', sender: 'BakugoBoom', timestamp: '1d ago', read: false },
  { id: 'n4', userId: 'DekuMaster', message: 'System Maintenance scheduled for Friday at 03:00 UTC.', type: 'danger', category: 'system', timestamp: '2d ago', read: true },
  { id: 'n5', userId: 'DekuMaster', message: 'LuffyKing: Hey, interested in joining the Straw Hat Alliance?', type: 'primary', category: 'user', sender: 'LuffyKing', timestamp: '3d ago', read: true },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: 'tic-001', tournamentName: "UA Sports Festival", date: "2025-05-21", status: 'confirmed', price: 15, qrCode: 'ENC-UA-9922' },
  { id: 'tic-002', tournamentName: "Grand Line Clash", date: "2025-05-23", status: 'confirmed', price: 20, qrCode: 'ENC-GL-1102' },
  { id: 'tic-003', tournamentName: "Season 5 Qualifiers", date: "2025-05-10", status: 'used', price: 10, qrCode: 'ENC-S5-8831' },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-7721', itemName: "Encarto Elite Hoodie", date: "May 18, 2025", status: 'shipped', price: 45 },
  { id: 'ORD-9902', itemName: "Limited Edition Neon Cap", date: "May 15, 2025", status: 'delivered', price: 25 },
  { id: 'ORD-1123', itemName: "MHA Battle Mat", date: "May 20, 2025", status: 'processing', price: 35 },
];

export const MOCK_STREAMS: Stream[] = [
  { id: 's1', title: "PRO LEAGUE FINALS: DEKU VS BAKUGO", streamer: "EncartoOfficial", viewers: "12.5k", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", isLive: true, startTime: "2025-05-20T18:00:00Z", game: "MHA: Ultra Rumble" },
  { id: 's2', title: "GRINDING TO RANK 15 - NO SLEEP", streamer: "LuffyKing", viewers: "4.2k", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", isLive: true, startTime: "2025-05-20T17:30:00Z", game: "One Piece Bounty Rush" },
  { id: 's3', title: "VOD: Grand Finals Replay", streamer: "EncartoOfficial", viewers: "2.1k", thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800", isLive: false, startTime: "2025-05-19T19:00:00Z", game: "Tournament" },
];

export const MATCH_FIXTURES: Fixture[] = [
  { id: 'f1', tournamentName: "UA Sports Festival", teamA: "DekuMaster", teamB: "BakugoBoom", time: "18:30", date: "2025-05-21", game: "MHA Battle", participants: ["DekuMaster", "BakugoBoom"], status: 'scheduled' },
  { id: 'f2', tournamentName: "Grand Line Open", teamA: "LuffyKing", teamB: "ZoroSlash", time: "21:00", date: "2025-05-20", game: "One Piece Clash", participants: ["LuffyKing", "ZoroSlash"], status: 'scheduled' },
];

export const BLOG_POSTS: BlogPost[] = [
  { id: 'b1', title: "Top 5 Strategies to Hit Rank 15", author: "Encarto Pro", date: "2h ago", category: "Pro Tips", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800", excerpt: "Mastering the ranks of Encarto requires more than just luck.", content: "Content for ranking strategies..." },
  { id: 'b2', title: "New Anime Themes Arriving in Store", author: "Admin", date: "1d ago", category: "Updates", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800", excerpt: "Personalize your dashboard with the new Bleach and JJK themed skins.", content: "Content for new themes..." },
];

export const UPCOMING_TOURNAMENTS: Tournament[] = [
  { 
    id: '1', 
    name: "UA Sports Festival", 
    game: "MHA: Ultra Rumble", 
    date: "2025-05-21", 
    status: 'upcoming', 
    entryFee: 15, 
    prize: "200 m3ga",
    maxPlayers: 256,
    registeredPlayers: ["BakugoBoom", "LuffyKing", "ZoroSlash"],
    rules: "1. No quirk-erasing drugs allowed. 2. Respect the referees. 3. Winner gets the medal and M3GA.",
    createdAt: "2025-05-15"
  },
  { 
    id: '2', 
    name: "Grand Line Clash", 
    game: "One Piece Bounty Rush", 
    date: "2025-05-23", 
    status: 'upcoming', 
    entryFee: 20, 
    prize: "350 m3ga",
    maxPlayers: 128,
    registeredPlayers: ["SanjiCook", "NamiWeather"],
    rules: "1. Only pirate crews allowed. 2. Devil fruit powers are permitted. 3. Reach the treasure first.",
    createdAt: "2025-05-18"
  },
];

export const MOCK_HALL_OF_FAME: HallOfFameEntry[] = [
  { winnerName: "AllMightFan#1", tournamentName: "UA Ultra Rumble Finals", date: "2025-05-15", rankAtWin: 15 },
  { winnerName: "ZoroFanatic", tournamentName: "Grand Line Blitz", date: "2025-05-14", rankAtWin: 14 },
  { winnerName: "ShadowNinja", tournamentName: "Hidden Leaf Cup", date: "2025-05-13", rankAtWin: 13 },
  { winnerName: "GamerGod", tournamentName: "Pro League Season 4", date: "2025-05-12", rankAtWin: 15 },
  { winnerName: "Kirito_Solo", tournamentName: "Aincrad Invitational", date: "2025-05-11", rankAtWin: 12 },
  { winnerName: "LuffyKing", tournamentName: "Pirate King Qualifiers", date: "2025-05-10", rankAtWin: 15 },
  { winnerName: "BakugoBoom", tournamentName: "Explosion Gala", date: "2025-05-09", rankAtWin: 14 },
  { winnerName: "NezukoSwift", tournamentName: "Demon Slayer Open", date: "2025-05-08", rankAtWin: 11 },
  { winnerName: "GokuUltra", tournamentName: "Tournament of Power", date: "2025-05-07", rankAtWin: 15 },
  { winnerName: "DekuMaster", tournamentName: "Junior Hero Exam", date: "2025-05-06", rankAtWin: 10 },
];
