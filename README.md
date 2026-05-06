# Arkestra - Orchestra Management Platform

A comprehensive full-stack web application for managing orchestras, events, members, bookings, repertoire, and finances. Built with Next.js 14, Prisma, and SQLite/Turso.

## Features

### Core Functionality
- **Orchestra Management** - Manage multiple orchestras with complete details
- **Event Management** - Schedule and organize concerts, rehearsals, and recordings
- **Booking System** - Handle member bookings for events efficiently
- **Member Management** - Track orchestra members with role-based positions
- **Availability Tracking** - Members can manage their availability schedules
- **Repertoire Management** - Maintain a library of musical pieces and compositions
- **Client CRM** - Manage clients with booking history and contact information
- **Payment Tracking** - Monitor payments, invoices, and financial transactions
- **Notification System** - Stay updated with real-time notifications

### User Features
- **Dashboard** - Real-time data visualization with statistics
- **Calendar Integration** - FullCalendar-based event scheduling
- **Role-Based Access** - Different permissions for admins, members, and clients
- **Authentication** - Secure login with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite/Turso with Prisma ORM
- **Authentication**: NextAuth.js
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Turso account (for production deployment)

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jitenkr2030/Arkestra.git
   cd Arkestra
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration if needed.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@symphonyhub.com | password123 |
| Member | violinist@symphonyhub.com | password123 |
| Member | cellist@symphonyhub.com | password123 |
| Member | pianist@symphonyhub.com | password123 |
| Member | flutist@symphonyhub.com | password123 |
| Client | client1@company.com | password123 |
| Client | client2@enterprise.com | password123 |

## Deployment

### Vercel + Turso (Recommended)

#### Step 1: Create Turso Database

1. Sign up at [turso.tech](https://turso.tech)
2. Install Turso CLI:
   ```bash
   brew install tursodatabase/tap/turso
   ```
3. Create a database:
   ```bash
   turso db create arkestra-db
   ```
4. Get the database URL:
   ```bash
   turso db show arkestra-db --url
   ```
5. Get the auth token:
   ```bash
   turso db tokens create arkestra-db
   ```

#### Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `libsql://arkestra-db-your-username.turso.io` | Production, Preview, Development |
| `TURSO_DATABASE_AUTH_TOKEN` | `<your-turso-auth-token>` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `<generate-at-https://generate-secret.vercel.app/>` | Production, Preview, Development |

#### Step 3: Push Schema to Turso

1. Update your `prisma/schema.prisma` to use Turso:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
     directUrl = env("DATABASE_URL")
   }
   ```

2. Push the schema to Turso:
   ```bash
   DATABASE_URL="libsql://arkestra-db.turso.io" TURSO_DATABASE_AUTH_TOKEN="your-token" npx prisma db push
   ```

3. Seed the database:
   ```bash
   DATABASE_URL="libsql://arkestra-db.turso.io" TURSO_DATABASE_AUTH_TOKEN="your-token" npx prisma db seed
   ```

#### Step 4: Redeploy

After adding environment variables, go to the **Deployments** tab and click **Redeploy** on the latest deployment.

### Alternative: Vercel Postgres

If you prefer PostgreSQL over SQLite, you can use Vercel Postgres:

1. In Vercel dashboard, go to **Storage** → **Create Database** → **Vercel Postgres**
2. Connect it to your project
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL")
   }
   ```
4. Set the environment variable `POSTGRES_URL` in Vercel (auto-set when you create the database)

## Project Structure

```
Arkestra/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── events/       # Event management
│   │   ├── members/      # Member management
│   │   ├── bookings/     # Booking management
│   │   ├── payments/     # Payment tracking
│   │   ├── clients/      # Client CRM
│   │   ├── repertoire/   # Repertoire library
│   │   ├── notifications/# Notifications
│   │   ├── calendar/     # Calendar view
│   │   ├── login/        # Login page
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── AppLayout.tsx # Main layout with sidebar
│   │   └── Sidebar.tsx   # Navigation sidebar
│   └── lib/
│       ├── auth.ts       # NextAuth configuration
│       └── prisma.ts     # Prisma client
├── .env                   # Environment variables
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## API Routes

| Endpoint | Description |
|----------|-------------|
| `/api/auth/[...nextauth]` | Authentication |
| `/api/orchestras` | Orchestra CRUD |
| `/api/events` | Event management |
| `/api/bookings` | Booking operations |
| `/api/members` | Member management |
| `/api/availability` | Availability tracking |
| `/api/repertoire` | Repertoire management |
| `/api/clients` | Client CRM |
| `/api/payments` | Payment tracking |
| `/api/notifications` | Notifications |
| `/api/stats` | Dashboard statistics |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma studio` | Open Prisma Studio |
| `npx prisma db push` | Push schema to database |
| `npx prisma db seed` | Seed database with sample data |

## License

MIT License

## Author

Built with care for orchestra management needs.