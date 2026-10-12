# Encarto Gaming Hub & Arena

Encarto is a multi-game platform featuring Encarto Arena, player progression, multiplayer experiences, and administration tools.

## Desktop installers

Encarto desktop packages are built by the GitHub Actions workflow **Build Encarto desktop installers** for Windows (NSIS `.exe`), macOS (`.dmg`), and Debian/Ubuntu Linux (`.deb`).

- Open the repository's **Actions** tab and run **Build Encarto desktop installers** manually to produce downloadable workflow artifacts.
- To publish installers as a GitHub Release, push a version tag such as `v1.0.0`. The release workflow attaches all three platform installers.
- The desktop app currently opens the hosted Encarto service at `https://encarto.vercel.app`. It is a desktop wrapper, not an offline copy: an internet connection and the deployed Encarto service are required. API, database, and multiplayer services remain hosted.
- External HTTPS links open in the system browser. The desktop window disables Node integration and uses context isolation and Chromium sandboxing.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client, Phaser.
- **Backend**: Node.js, Express 5, TypeScript, Socket.IO.
- **Database & ORM**: PostgreSQL (compatible with Neon serverless Postgres), Prisma ORM.
- **Authentication**: Cookie-based sessions with role-based access control.
- **Testing**: Vitest, Supertest.

## Getting Started & Local Setup

### Prerequisites

- Node.js 22 recommended
- PostgreSQL database (for example, Neon Postgres)

### Environment Configuration

Copy `.env.example` to `.env` and configure the database URL. Never commit `.env` or production credentials. Production requires unique session secrets and admin credentials.

```bash
cp .env.example .env
npm install
npx prisma generate
npm test
npm run lint
npm run build
```
