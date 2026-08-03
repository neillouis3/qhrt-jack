# QHRT Web App

A Next.js-based web application that provides guided mental health resources and self-paced therapeutic programs. QHRT supports users through condition selection, intake assessments, and structured therapeutic sessions powered by configurable knowledge models.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React 19](https://react.dev/) with [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Auth:** [Supabase](https://supabase.com) (PostgreSQL, Auth, Row-Level Security)

## Prerequisites

- **Node.js** 20+ and **npm** (or yarn/pnpm/bun)
- A **Supabase** project with the database schema migrated (see `supabase/` for SQL migration files)

## Getting Started

### 1. Clone & install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public JWT key |
| `SUPABASE_SECRET_KEY` | Supabase service role key (server-side API routes) |

### 3. Set up the database

Run the SQL migration files in `supabase/` in order via the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

```
supabase/001_condition_library_schema.sql
supabase/002_content_layer_seed.sql
supabase/003_conversation_framework_schema.sql
supabase/004_sleep_knowledge_model_seed.sql
supabase/005_therapeutic_engine_schema.sql
supabase/006_body_composition_seed.sql
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |

## Project Structure

```
├── app/                       # Next.js App Router pages & API routes
│   ├── (admin)/               # Admin dashboard, users, content, analytics
│   ├── (user)/                # User-facing home, sessions, intake
│   ├── api/                   # REST API routes (auth, admin, conversation, etc.)
│   └── auth/                  # Login/signup pages
├── components/                # Shared React components
│   ├── admin/                 # Admin-specific UI components
│   ├── conversation/          # Conversation & session UI
│   └── therapeutic/           # Therapeutic engine UI
├── hooks/                     # Custom React hooks (useSession, useNavigationGuard)
├── lib/                       # Utilities & clients
│   ├── supabaseClient.ts      # Supabase client setup
│   ├── adminAuth.ts           # Admin authentication helpers
│   ├── conversationEngine.ts  # Conversation logic
│   └── therapeuticEngine.ts   # Therapeutic engine logic
├── supabase/                  # Database migrations & seed data
└── public/                    # Static assets
```

## Architecture Overview

### User Flow
1. **Landing** -> Unauthenticated users see a landing page; authenticated users are directed to their dashboard.
2. **Intake & Condition Selection** -> New users select conditions and complete an intake assessment.
3. **Sessions** -> Users engage with therapeutic sessions driven by knowledge models and the therapeutic engine.

### Admin Flow
1. **Dashboard** -> Overview stats (total users, completions, sessions).
2. **Users** -> View and manage user accounts and roles.
3. **Content** -> Manage conditions, categories, knowledge models, and therapeutic engines.
4. **Analytics** -> View usage and engagement analytics.

### Authentication
- Supabase Auth handles user sign-up, login, and session management.
- Roles (`admin`, `user`) are stored in a `user_roles` table and enforced via Row-Level Security policies.
- Server-side API routes use the Supabase service role key for admin operations.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
