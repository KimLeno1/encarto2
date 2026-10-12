import bcrypt from 'bcryptjs';
import { prisma } from '../server/db/client.ts';
import { env } from '../server/config/env.ts';

async function seedAdmin() {
  const username = env.ADMIN_USERNAME || 'encartomaster';
  const email = env.ADMIN_EMAIL || 'admin@encarto.gg';
  const password = env.ADMIN_PASSWORD || 'EncartoAdmin2026!';

  console.log(`[SEED ADMIN] Checking administrative account: ${username} (${email})...`);

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'ADMIN',
          isAdmin: true,
          passwordHash,
        },
      });
      console.log(`[SEED ADMIN] Existing user upgraded to ADMIN: ${updated.username}`);
    } else {
      const created = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          role: 'ADMIN',
          isAdmin: true,
          rank: 15,
          exp: 99999,
          balance: 50000.0,
          bio: 'Platform Root Administrator',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoAdmin',
          profile: {
            create: {
              selectedTheme: 'mha',
            },
          },
        },
      });
      console.log(`[SEED ADMIN] Admin account provisioned: ${created.username} (ID: ${created.id})`);
    }

    console.log('[SEED ADMIN] Admin bootstrap complete.');
  } catch (error) {
    console.error('[SEED ADMIN] Failed to seed admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
