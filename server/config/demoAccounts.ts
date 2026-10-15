export interface DemoAccount {
  key: 'pilot' | 'admin';
  label: string;
  badge: string;
  tagline: string;
  usernames: string[];
  passwords: string[];
  user: {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    rank: number;
    exp: number;
    balance: number;
    avatarUrl: string;
    bio: string;
    profile: {
      id: string;
      userId: string;
      selectedTheme: string;
      phone: string;
      birthday: string;
      activePlugin: string;
      activeDecoration: string;
    };
    ownedItems: string[];
  };
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: 'pilot',
    label: 'Demo Pilot (Pro Gamer)',
    badge: 'PRO PLAYER',
    tagline: 'Rank 14 Gladiator • 350.00 M3GA • Tournament Qualified',
    usernames: ['demo_pilot', 'pilot', 'demo', 'pilot@encarto.gg', 'demopilot'],
    passwords: ['EncartoDemo2026!', 'demo1234', 'password', 'demo', 'encarto', 'pilot123'],
    user: {
      id: 'demo-pilot',
      username: 'demo_pilot',
      email: 'pilot@encarto.gg',
      role: 'USER',
      rank: 14,
      exp: 4850,
      balance: 350.0,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoPilot&backgroundColor=b6e3f4',
      bio: 'Elite Encarto Duelist & Tournament Competitor • Rank 14 Gladiator',
      profile: {
        id: 'prof-demo-pilot',
        userId: 'demo-pilot',
        selectedTheme: 'mha',
        phone: '+1 (555) 019-2834',
        birthday: '2002-08-15',
        activePlugin: 'cyber-aim-v2',
        activeDecoration: 'cyber-halo',
      },
      ownedItems: ['item-pro-pass', 'skin-neon-blade', 'role-competitor'],
    },
  },
  {
    key: 'admin',
    label: 'Demo Commander (System Admin)',
    badge: 'SYSTEM ADMIN',
    tagline: 'Level 99 Commander • 2,500.00 M3GA • Full Control Access',
    usernames: ['demo_admin', 'admin', 'encartomaster', 'admin@encarto.gg', 'demoadmin'],
    passwords: ['EncartoAdmin2026!', 'admin1234', 'admin', 'password', 'encarto', 'admin2026'],
    user: {
      id: 'demo-admin',
      username: 'demo_admin',
      email: 'admin@encarto.gg',
      role: 'ADMIN',
      rank: 99,
      exp: 99999,
      balance: 2500.0,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoCommander&backgroundColor=c0aede',
      bio: 'High Commander & System Administrator • Encarto Operations Director',
      profile: {
        id: 'prof-demo-admin',
        userId: 'demo-admin',
        selectedTheme: 'solo-leveling',
        phone: '+1 (555) 990-0001',
        birthday: '1998-03-22',
        activePlugin: 'admin-overdrive',
        activeDecoration: 'championship-crown',
      },
      ownedItems: ['item-vip-pass', 'role-organizer', 'role-admin', 'skin-quantum-reaper'],
    },
  },
];

export function findMatchingDemoAccount(identifier: string, password?: string): DemoAccount | undefined {
  const cleanId = identifier.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((acc) => {
    const usernameMatch = acc.usernames.some((u) => u.toLowerCase() === cleanId);
    const emailMatch = acc.user.email.toLowerCase() === cleanId;
    if (!usernameMatch && !emailMatch) return false;
    if (password === undefined) return true;
    return acc.passwords.includes(password.trim());
  });
}
