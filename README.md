# Encarto Gaming Hub & Arena

Encarto is a high-performance multi-game platform featuring **Encarto Arena** (real-time 2D multiplayer PvP with Socket.IO matchmaking and bot fallback), persistent player progression (XP, levels, rank tiers, match history), and a secure administration dashboard with full audit logging.

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

Example `.env`:
```env
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# PostgreSQL Connection String (e.g. Neon Postgres)
DATABASE_URL=postgresql://user:password@ep-sample.region.neon.tech/encarto_db?sslmode=require

# Session & Security
SESSION_SECRET=encarto-super-secret-session-key-change-in-production-min32chars
CORS_ORIGIN=http://localhost:3000

# Initial Admin Provisioning
ADMIN_USERNAME=encartomaster
ADMIN_EMAIL=admin@encarto.gg
ADMIN_PASSWORD=EncartoAdmin2026!
```

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
