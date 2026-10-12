import bcrypt from 'bcryptjs';
import { prisma } from '../server/db/client.ts';
import { env } from '../server/config/env.ts';

async function seedAdmin(): Promise<void> {
  // Configuration is validated at startup. Never fall back to a public/default password.
  const username = env.ADMIN_USERNAME.trim();
  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  if (!username || !email || password.length < 16) {
    throw new Error('Admin provisioning requires ADMIN_USERNAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 16 characters.');
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: { equals: username, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true, email: true, role: true },
    });

    if (existing) {
      // Do not silently promote an existing account or reset its password based on a
      // username/email collision. Use a separately reviewed, authenticated admin recovery flow.
      throw new Error(
        `Admin provisioning stopped: an account already matches the configured username or email (user ID ${existing.id}). No account was changed.`
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const created = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'ADMIN',
        isAdmin: true,
        rank: 1,
        exp: 0,
        balance: 0,
        bio: 'Platform Administrator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EncartoAdmin',
        profile: {
          create: { selectedTheme: 'mha' },
        },
      },
      select: { id: true, username: true, email: true },
    });

    console.log(`[SEED ADMIN] Administrative account created: ${created.username} (${created.email}).`);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown admin provisioning failure.';
  console.error('[SEED ADMIN] Failed:', message);
  process.exitCode = 1;
});
