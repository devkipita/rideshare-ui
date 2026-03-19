# Kipita - Carpool App

A mobile-first carpooling app for Kenya built with **Next.js 16**, **Supabase**, **NextAuth**, and **Tailwind v4 + Shadcn/UI**.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Supabase (PostgreSQL), NextAuth (Google OAuth + Credentials)
- **Styling:** Tailwind CSS v4 (OKLch color system), Shadcn/UI, Framer Motion
- **Forms:** React Hook Form + Zod validation

## Project Structure

```
app/              → Pages and API routes (Next.js App Router)
app/api/rides/    → Ride posting (POST) and search (GET)
app/api/ride-requests/ → Passenger ride requests CRUD
app/api/announcements/ → Road announcements CRUD
app/api/notifications/ → Composite notification feed
components/       → All UI components (passenger, driver, shared)
components/ui/    → Shadcn/UI primitives (60+ components)
lib/              → Auth config, Supabase clients, RBAC, utilities
lib/supabase/     → Supabase client/server/admin instances
hooks/            → Custom React hooks (use-mobile, use-toast)
supabase/migrations/ → Database schema migrations
public/           → Static assets
config.ts         → Centralized app config (features, limits, localization)
```

## App Modes

The app has two user roles with separate tab navigation:

**Passenger Mode:** Search | Trips | Messages | Profile
**Driver Mode:** My Rides | Ride Requests | Earnings | Profile

Mode is managed via `AppModeContext` in `app/context.tsx`. The splash screen (`KipitaSplash`) lets users choose "Join a Ride" or "Offer a Ride".

## Core Features

### Authentication
- Google OAuth and email/password sign-in via NextAuth (JWT strategy)
- User registration: `POST /api/auth/signup`
- Phone verification: `/api/users/phone/start` and `/api/users/phone/verify`
- Avatar upload: `/api/users/me/avatar`
- Password hashing with bcryptjs

### Driver — Post Rides (DB-persisted)
- **Post rides** with route, date/time, seats (1-6), price per seat, and amenities — `driver-offer-ride.tsx`
- Form submits to `POST /api/rides` which inserts into `rides` table in Supabase
- Fields mapped: from→origin, to→destination, date+time→departure_time (ISO), seats→total_seats/available_seats, price→price_per_seat, pets→allows_pets, luggage→allows_packages
- Success animation shown after DB confirmation
- **Manage requests** (pending/accepted/rejected tabs) with accept/decline actions — `driver-requests.tsx`
- **Earnings dashboard** with monthly/all-time stats and recent activity — `driver-earnings.tsx`
- **Driver profile** with verification status — `driver-profile-drawer.tsx`

### Passenger — Search Rides (DB-backed)
- **Search rides** with from/to location autocomplete (50+ Kenyan towns from `lib/kenyan-towns.ts`), date, seat count, and preferences (pets, luggage) — `passenger-search.tsx`, `PassengerSearchForm.tsx`
- Search calls `GET /api/rides?from=X&to=Y&date=Z&seats=N&pets=true&luggage=true` which queries real DB
- **Today's rides carousel** fetches live rides from `GET /api/rides?date=today` with fallback to sample data
- **Browse results** with driver name/image (joined from users table), pricing, and seats left — `RideResults.tsx`
- **View ride details** and request seats or message driver — `ride-details.tsx`
- **Post ride request** when no rides found — button in RideResults calls `POST /api/ride-requests`
- **Track requests** fetched from `GET /api/ride-requests` (real DB data) — `my-rides.tsx`

### Road Announcements (DB-persisted)
- **Anyone can post** road condition updates (traffic, protests, roadblocks, etc.)
- Posts saved to `announcements` table via `POST /api/announcements`
- Announcements appear in the notifications feed for all users

### Notifications (Real-time feed)
- **Composite feed** from `GET /api/notifications` — merges recent rides (last 48h) + announcements into unified `Notice[]`
- Polls every 30 seconds for new data
- Rides appear as "ride" notifications with driver name, price, seats
- Announcements appear with poster name and severity level
- Client-side filtering by kind (ride/announcement/system), severity, read status
- Search across notification title, body, location, route
- Mark read/unread per notification or bulk mark-all-read

### Messaging
- Real-time chat between drivers and passengers — `global-chat.tsx`
- Unread count tracking and read status
- Chat accessible from ride details and request management

### Profile
- View/edit profile (name, email, phone, avatar) — `profile-screen.tsx`
- Phone verification flow
- Role display (passenger/driver)

## Database Tables

Core schema in `supabase/migrations/20260210_carpool_schema.sql`:

| Table | Purpose |
|---|---|
| `users` | User accounts (NextAuth compatible) |
| `driver_profiles` | Driver verification (national ID, license) |
| `vehicles` | Driver vehicles |
| `rides` | Posted rides (origin, destination, departure_time, price, seats, status) |
| `bookings` | Passenger bookings on rides |
| `payments` | Escrow-ready payment records (M-Pesa) |
| `trip_confirmations` | Double-confirmation for trip completion |
| `ratings` | Post-trip ratings and reviews |
| `messages` | Ride-scoped in-app messages |
| `phone_verifications` | Phone OTP verification records |

Added in `supabase/migrations/20260320_ride_requests_and_announcements.sql`:

| Table | Purpose |
|---|---|
| `ride_requests` | Passenger-posted ride requests (when no rides found) |
| `announcements` | Road condition updates posted by any user |

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/me` | GET | Current user info |
| `/api/users/me` | GET/PATCH | Get/update profile |
| `/api/users/me/avatar` | POST | Upload avatar |
| `/api/users/phone/start` | POST | Start phone verification |
| `/api/users/phone/verify` | POST | Verify OTP |
| `/api/drivers/me` | GET/PATCH | Driver profile and stats |
| `/api/rides` | POST | Driver posts a new ride (requires driver role) |
| `/api/rides` | GET | Search rides with filters (from, to, date, seats, pets, luggage) |
| `/api/ride-requests` | POST | Passenger posts a ride request |
| `/api/ride-requests` | GET | Fetch ride requests (own for passengers, all active for drivers) |
| `/api/announcements` | POST | Post a road announcement |
| `/api/announcements` | GET | Fetch recent announcements (last 50) |
| `/api/notifications` | GET | Composite feed: recent rides + announcements as notifications |

## API Pattern

All API routes follow the same pattern (see `app/api/drivers/me/route.ts` as reference):
1. `getServerSession(authOptions)` for auth
2. `supabaseAdmin` (service role) for DB queries (bypasses RLS)
3. `NextResponse.json()` for responses
4. `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`

## Navigation

- `bottom-nav.tsx` — Tab bar (changes tabs based on passenger/driver mode)
- `top-nav.tsx` — Header with back button, logo, theme toggle
- Navigation state persisted in localStorage (`kipita_nav_snapshot`)

## UI System

- `ui-parts.tsx` — Custom components: Surface, BottomSheet, PillButton, ChipToggle, LocationInput, DatePickerCard, ShimmerCard, MapPreview
- Material Design 3-inspired surface tokens (base, raised, sheet, panel)
- Dark/light theme via `next-themes`
- Mobile-first layout capped at 430px width

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Key Config

`config.ts` contains feature flags, seat/price limits, animation settings, localization (English/Swahili), Kenya coordinates, ride statuses, API timeouts, and message templates.

## Data Flow Summary

1. **Driver posts ride** → `driver-offer-ride.tsx` → `POST /api/rides` → `rides` table → appears in passenger search + notifications
2. **Passenger searches** → `passenger-search.tsx` → `GET /api/rides` → real DB results with driver info
3. **No results → post request** → `RideResults.tsx` → `POST /api/ride-requests` → `ride_requests` table → visible to drivers
4. **Road announcement** → `messages-screen.tsx` → `POST /api/announcements` → `announcements` table → appears in notifications feed
5. **Notifications** → `messages-screen.tsx` → `GET /api/notifications` → polls every 30s → merges rides + announcements
