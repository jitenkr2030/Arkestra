# Arkestra - Orchestra Management Platform

A comprehensive full-stack web application for managing orchestras, events, members, bookings, repertoire, and finances. Built with Next.js 14, Prisma, and SQLite.

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
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

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

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## Default Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@orchestra.com | admin123 |
| Member | john@example.com | member123 |
| Member | jane@example.com | member123 |
| Client | client@example.com | client123 |

## Project Structure

```
Arkestra/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── (auth)/       # Auth pages
│   │   ├── (main)/       # Main app pages
│   │   └── page.tsx      # Root page
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   └── features/      # Feature-specific components
│   └── lib/
│       ├── auth.ts       # NextAuth configuration
│       └── prisma.ts     # Prisma client
├── .env                   # Environment variables
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio |
| `npx prisma db seed` | Seed database |

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

## Deployment

This application can be deployed to platforms that support Node.js:

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Railway
Connect your GitHub repository to Railway for automatic deployment.

### Render
Create a Web Service and configure:
- Build Command: `npm run build`
- Start Command: `npm start`

## License

MIT License

## Author

Built with care for orchestra management needs.
