
export interface PlayerProfile {
  id?: string;
  name: string;
  rank: number; // 1-15
  exp: number;
  balance: number; // m3ga coins
  avatar: string; // URL or identifier
  badges: Badge[];
  email: string;
  phone: string;
  birthday: string; // YYYY-MM-DD
  team: string; 
  teamId?: string;
  isLeader?: boolean;
  bio: string;
  password?: string;
  activePlugin?: string;
  activeDecoration?: string;
  ownedItems: string[]; // List of IDs from ShopItem
  role?: 'USER' | 'MODERATOR' | 'ORGANIZER' | 'ADMIN';
  isSystemAdmin?: boolean; // Hidden flag for platform admins
}

export interface Team {
  id: string;
  name: string;
  image: string;
  about: string;
  info: string;
  leaderId: string;
  members: string[];
  memberCount: number;
  joinRequests: string[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'primary';
  category: 'system' | 'admin' | 'user';
  sender?: string;
  timestamp: string;
  read: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  date: string; // ISO date string or human readable
  status: 'active' | 'upcoming' | 'completed';
  entryFee: number;
  prize: string;
  organizer?: string;
  maxPlayers: number;
  registeredPlayers: string[];
  rules: string;
  createdAt: string;
}

export interface Fixture {
  id: string;
  tournamentName: string;
  teamA: string;
  teamB: string;
  time: string;
  date: string;
  game: string;
  participants: string[];
  status: 'scheduled' | 'live' | 'finished';
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: 'Updates' | 'Pro Tips' | 'Community' | 'Meta';
  image: string;
  excerpt: string;
  content: string;
}

export interface Stream {
  id: string;
  title: string;
  streamer: string;
  viewers: string;
  thumbnail: string;
  isLive: boolean;
  startTime: string; 
  game: string;
}

export interface Ticket {
  id: string;
  tournamentName: string;
  date: string;
  status: 'confirmed' | 'used' | 'cancelled';
  price: number;
  qrCode?: string;
}

export interface Order {
  id: string;
  itemName: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  price: number;
  image?: string;
}

export interface HallOfFameEntry {
  winnerName: string;
  tournamentName: string;
  date: string;
  rankAtWin: number;
}

export const PanelType = {
  MAIN: 'MAIN',
  ADMIN: 'ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  STORE: 'STORE',
  BADGES: 'BADGES',
  TICKETS: 'TICKETS',
  ORDERS: 'ORDERS',
  TEAMS: 'TEAMS',
  NOTIFICATIONS: 'NOTIFICATIONS',
  HALL_OF_FAME: 'HALL_OF_FAME',
  TOURNAMENTS: 'TOURNAMENTS',
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  FIXTURES: 'FIXTURES',
  BLOG: 'BLOG',
  STREAMING: 'STREAMING',
  CHAT: 'CHAT',
  PVP: 'PVP',
  ARENA: 'ARENA',
  ABOUT: 'ABOUT',
  ORGANIZER: 'ORGANIZER'
} as const;

export type PanelType = typeof PanelType[keyof typeof PanelType];

export type AnimeTheme = 'mha' | 'onepiece' | 'naruto' | 'violet-rift' | 'cyberwave' | 'arctic-pulse' | 'emberstorm' | 'sakura-bloom';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'merch' | 'plugin' | 'theme' | 'role' | 'decoration' | 'team';
  image?: string;
  requirements?: {
    minRank?: number;
    minAge?: number;
    roles?: Array<'USER' | 'MODERATOR' | 'ORGANIZER' | 'ADMIN'>;
  };
  description?: string;
  themeKey?: AnimeTheme;
}

export interface ArticleData {
  title: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
  }[];
  relatedTopics: string[];
  suggestedPrompts: string[];
}
