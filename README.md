# Encarto Gaming Hub & Arena

Encarto is a high-performance multi-game platform featuring **Encarto Arena** (real-time 2D multiplayer PvP with Socket.IO matchmaking and bot fallback), persistent player progression (XP, levels, rank tiers, match history), and a secure administration dashboard with full audit logging.

## Desktop installers

The GitHub Actions workflow **Build Encarto desktop installers** builds Windows (NSIS `.exe`), macOS (`.dmg`), and Debian/Ubuntu Linux (`.deb`) packages.

- Run the workflow manually from the repository's **Actions** tab to download platform-specific artifacts.
- Push a version tag such as `v1.0.0` to publish a GitHub Release containing the installers.
- The desktop app currently opens `https://encarto.vercel.app`; it is a desktop wrapper, not an offline copy. An internet connection and the hosted service are required, while API, database, and multiplayer services remain hosted.
- External HTTPS links open in the system browser. The desktop window disables Node integration and enables context isolation and Chromium sandboxing.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client, Phaser.
- **Backend**: Node.js, Express 5, TypeScript, Socket.IO.
- **Database & ORM**: PostgreSQL (compatible with **Neon** serverless Postgres), Prisma ORM.
- **Authentication**: Secure cookie-based session authentication with role-based access control (USER, MODERATOR, ORGANIZER, ADMIN).
- **Testing**: Vitest, Supertest.

---

## Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (e.g., **Neon** Postgres database connection string)

### Environment Configuration
Copy `.env.example` to `.env` and configure your database URL:
```bash
cp .env.example .env
```

Example development configuration (replace the placeholders before provisioning an admin):
```env
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/encarto_db?schema=public
SESSION_SECRET=replace-with-random-32-plus-character-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
ADMIN_USERNAME=replace-with-admin-username
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-unique-password-at-least-16-chars
```

Never commit `.env` or production credentials. Production requires explicit, unique values; placeholder/default session secrets and admin passwords are rejected. Admin provisioning creates a new account only and refuses to promote or overwrite an existing account.

### Deployment architecture warning

This repository's build script runs `vite build`, while `server.ts` starts a persistent Express + Socket.IO HTTP server. The repository currently has no Vercel function entrypoint or `vercel.json` routing configuration. A standard Vercel static/Vite deployment does **not** automatically start `server.ts`; API and Socket.IO functionality therefore needs explicit deployment verification. Use a persistent Node.js host for the Express/Socket.IO server, or design and test a compatible deployment architecture before relying on these endpoints in production.

### Installation & Database Migration
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run database migrations and seed initial data:
   ```bash
   npx prisma migrate dev --name init
   npm run seed:admin
   ```

### Running the Application
- **Development Server** (Express backend + Vite frontend middleware on port 3000):
  ```bash
  npm run dev
  ```
- **Production Build**:
  ```bash
  npm run build
  npm start
  ```
- **Run Automated Test Suite**:
  ```bash
  npm test
  ```

---

## Key Features
1. **Real-Time Multiplayer PvP & Matchmaking**:
   - Queue-based matchmaking with configurable timeouts.
   - Bot match fallback option with explicit AI practice labeling.
   - Server-authoritative gameplay synchronization (movement, combat, health, score).
2. **Player Progression & Records**:
   - Automated XP award and rank tier progression upon completed matches.
   - Detailed match history, statistics, and idempotent transaction records.
3. **Administration Dashboard**:
   - Account inspection, suspension/reactivation, role management.
   - Game availability configuration, bot difficulty parameters, progression rules.
   - Real-time system health and audit log inspection.
