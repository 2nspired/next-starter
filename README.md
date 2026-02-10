# Next Starter

A full-stack Next.js starter template with Supabase auth, tRPC, Prisma, and shadcn/ui. Includes an example CRUD entity demonstrating the complete router → service → Prisma flow.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Auth | [Supabase Auth](https://supabase.com/docs/guides/auth) via `@supabase/ssr` |
| API | [tRPC v11](https://trpc.io/) with [React Query v5](https://tanstack.com/query) |
| Database | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` (Supabase Postgres) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Validation | [Zod 4](https://zod.dev/) + [T3 Env](https://env.t3.gg/) |
| Linting | [Biome](https://biomejs.dev/) |
| Testing | [Vitest](https://vitest.dev/) + Testing Library |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) (dark mode) |
| Toasts | [Sonner](https://sonner.emilkowal.dev/) |

## Getting Started

### 1. Create a new repo from the template

Click **"Use this template"** → **"Create a new repository"** on GitHub, then:

```bash
git clone <your-new-repo-url> my-app
cd my-app
npm install
```

### 2. Create a Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values from your Supabase project dashboard:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → `service_role` key |
| `DATABASE_URL` | Settings → Database → Connection string (Transaction mode, port **6543**) |
| `DIRECT_URL` | Settings → Database → Connection string (Direct, port **5432**) |

**Why two database URLs?**
- `DATABASE_URL` uses the **connection pooler** (port 6543) — used at runtime by `@prisma/adapter-pg` for efficient connection management.
- `DIRECT_URL` uses a **direct connection** (port 5432) — used only for migrations (`prisma migrate`), which need a persistent connection.

### 4. Run SQL setup scripts

Open the **SQL Editor** in your Supabase dashboard and run these files in order:

1. **`sql/01-trigger.sql`** — Creates a trigger that automatically inserts a `user_profile` row whenever a new user signs up via Supabase Auth.
2. **`sql/02-rls-policies.sql`** — Enables Row Level Security on `user_profile` and `item` tables so users can only access their own data.

### 5. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

This creates the `user_profile` and `item` tables in your database.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, signup, etc.)
│   │   ├── auth/
│   │   │   ├── actions.ts        # Server actions (login, signup, reset)
│   │   │   ├── confirm/route.ts  # Email confirmation handler
│   │   │   ├── check-email/      # "Check your inbox" page
│   │   │   ├── error/            # Auth error page
│   │   │   ├── forgot/           # Forgot password page
│   │   │   └── reset/            # Set new password page
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   └── layout.tsx            # Centered auth layout
│   ├── (main)/                   # Authenticated route group
│   │   ├── dashboard/            # Example CRUD page
│   │   └── layout.tsx            # Header + nav layout
│   ├── api/trpc/[trpc]/route.ts  # tRPC HTTP handler
│   ├── globals.css               # Tailwind + shadcn CSS variables
│   ├── layout.tsx                # Root layout (providers)
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   └── page.tsx                  # Landing page
├── components/
│   ├── auth/                     # Auth components (provider, logout)
│   ├── dev/                      # Dev-only components (breakpoint indicator)
│   ├── theme/                    # Theme provider
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── schemas/                  # Zod validation schemas
│   ├── format-date.ts            # Date formatting utilities
│   ├── get-base-url.ts           # URL detection utility
│   └── utils.ts                  # cn() class merge utility
├── server/
│   ├── api/
│   │   ├── routers/              # tRPC routers (item, user)
│   │   ├── root.ts               # App router
│   │   └── trpc.ts               # tRPC init, context, procedures
│   ├── services/
│   │   ├── types/                # ServiceResult type
│   │   ├── item-service.ts       # Item CRUD service
│   │   └── user-service.ts       # User service
│   └── db.ts                     # Prisma client singleton
├── trpc/
│   ├── query-client.ts           # React Query config
│   ├── react.tsx                 # tRPC client provider
│   └── server.ts                 # tRPC server caller + hydration
├── types/
│   └── action-result.ts          # ActionResult type
├── utilities/
│   ├── auth/server.ts            # getAuth(), getSessionUser()
│   └── supabase/
│       ├── admin.ts              # Supabase admin client (service_role)
│       ├── client.ts             # Browser Supabase client
│       ├── middleware.ts          # Session refresh middleware
│       └── server.ts             # Server Supabase client
├── env.ts                        # T3 env validation
└── proxy.ts                      # Next.js proxy (auth middleware)
```

## Architecture

### Auth Flow

```
Browser → proxy.ts (updateSession) → Supabase Auth → cookies
                                                    ↓
Server Component → getAuth() → supabaseServerClient → user session
                             → getUserProfile()     → Prisma DB
                                                    ↓
                  AuthProvider (React Context) → useAuth() in client components
```

1. `proxy.ts` runs on every request, refreshing the Supabase session via cookies.
2. `getAuth()` reads the session server-side and fetches the user profile from Prisma.
3. The `AuthProvider` passes the auth state to client components via React Context.

### API Flow

```
Client Component → api.item.create.useMutation()
                 ↓
tRPC Client → /api/trpc → itemRouter.create
                         ↓
              protectedProcedure (auth check)
                         ↓
              itemService.create(userId, data)
                         ↓
              ServiceResult<Item> → success/error
                         ↓
              Router unwraps → TRPCError or data
```

1. Client components use `api.item.*` hooks from tRPC React Query.
2. Requests hit the tRPC HTTP handler at `/api/trpc`.
3. `protectedProcedure` verifies the user is authenticated.
4. The router calls a service method which returns a `ServiceResult<T>`.
5. The router unwraps the result — throws `TRPCError` on failure, returns data on success.

### ServiceResult Pattern

Every service method returns `Promise<ServiceResult<T>>`:

```typescript
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

This keeps error handling consistent and separates business logic (services) from API concerns (routers).

## Common Tasks

### Add a new entity

1. **Schema**: Add model to `prisma/schema.prisma`, run `npx prisma migrate dev`
2. **Zod schemas**: Create `src/lib/schemas/my-entity-schemas.ts`
3. **Service**: Create `src/server/services/my-entity-service.ts` returning `ServiceResult<T>`
4. **Router**: Create `src/server/api/routers/my-entity.ts`, add to `root.ts`
5. **Page**: Create `src/app/(main)/my-entity/page.tsx` using `api.myEntity.*` hooks

### Add a shadcn component

```bash
npx shadcn@latest add [component-name]
```

### Add a new environment variable

1. Add to `.env.local`
2. Add validation in `src/env.ts` (server or client section)
3. Add to `runtimeEnv` mapping
4. Document in `.env.example`

### Run tests

```bash
npm test              # Run all tests once
npx vitest            # Run in watch mode
npx vitest --ui       # Run with UI
```

## Supabase Setup

### auth.users ↔ user_profile

Supabase manages authentication in the `auth` schema. When a user signs up, the `on_auth_user_created` trigger automatically creates a matching row in `public.user_profile`. This keeps your app's user data in the `public` schema where Prisma can manage it, while Supabase handles passwords, sessions, and email verification.

### Row Level Security (RLS)

RLS policies ensure users can only read/write their own data at the database level. Even if your application code has a bug, RLS prevents data leaks. The policies in `sql/02-rls-policies.sql` scope all operations to `auth.uid()` — the currently authenticated user's ID.

## Production Checklist

Things to add per-project:

- [ ] Rate limiting (e.g., `@upstash/ratelimit`)
- [ ] Content Security Policy headers
- [ ] Error monitoring (e.g., Sentry)
- [ ] CI/CD pipeline
- [ ] Email templates in Supabase dashboard
- [ ] Custom domain and `NEXT_PUBLIC_SITE_URL`
- [ ] Analytics (e.g., Vercel Analytics, PostHog)
- [ ] Backup strategy for database
