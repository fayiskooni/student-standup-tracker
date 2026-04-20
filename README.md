# Mentrex Standup

A daily standup tracker for **Mentrex Academy** — built with Next.js 14 (App Router), Supabase, and Tailwind CSS.

Track student progress, run daily standups, monitor WPM and speaking levels, and manage presentations — all with a premium dark purple UI.

## Features

- **Student Board** — Grid of student cards with live standup status (Done/Pending/Absent)
- **Daily Standup** — Admin runs standups via a slide-over drawer form
- **Analytics Dashboard** — WPM charts, speaking level timelines, presentation tracker, sortable summary table
- **Student Management** — Add/edit/delete students with photo uploads to Supabase Storage
- **Auth** — Supabase email/password auth with protected admin routes
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **Database + Auth + Storage**: Supabase
- **Charts**: Recharts
- **Icons**: Lucide React
- **Font**: Inter (via next/font/google)
- **Date Utils**: date-fns

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd stand-up
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API

### 3. Set environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the database migration

1. Go to Supabase Dashboard → SQL Editor
2. Paste the contents of `supabase/migration.sql` and run it
3. Go to Storage and create a **public** bucket called `student-photos`

### 5. Create an admin user

In Supabase Dashboard → Authentication → Users, create a new user with email and password. This will be your admin account.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── standups/      # Standup CRUD API routes
│   │   └── students/      # Student CRUD API routes
│   ├── dashboard/          # Analytics dashboard page
│   ├── login/              # Admin login page
│   ├── standup/            # Run standup page (admin)
│   ├── students/           # Student management page (admin)
│   ├── globals.css         # Design system & theme
│   ├── layout.tsx          # Root layout with NavBar + Toast
│   └── page.tsx            # Home — student grid
├── components/
│   ├── NavBar.tsx           # Navigation bar
│   ├── PresentationCard.tsx # Presentation display card
│   ├── SpeakingTimeline.tsx # Speaking level progress timeline
│   ├── StandupDrawer.tsx    # Slide-over standup form
│   ├── StatCard.tsx         # Dashboard metric card
│   ├── StatusBanner.tsx     # Standup progress banner
│   ├── StudentCard.tsx      # Student display card
│   ├── Toast.tsx            # Toast notification system
│   └── WPMChart.tsx         # WPM line chart (Recharts)
├── lib/supabase/
│   ├── client.ts            # Browser Supabase client
│   ├── middleware.ts         # Auth middleware helper
│   └── server.ts            # Server Supabase client
├── types/
│   └── index.ts             # TypeScript interfaces
└── middleware.ts             # Next.js route protection
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set the environment variables in Vercel Dashboard → Settings → Environment Variables.

## License

MIT
