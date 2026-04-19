# Kipita - Carpool App

A mobile-first carpooling app for Kenya built with **Next.js 16**, **Supabase**, **NextAuth**, **Tailwind v4 + Shadcn/UI**, and **React Email**.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Supabase (PostgreSQL), NextAuth (Google OAuth + Credentials)
- **Styling:** Tailwind CSS v4 (OKLch color system), Shadcn/UI, Framer Motion
- **Forms:** React Hook Form + Zod validation
- **Payments:** M-Pesa STK Push (stub) + Card (stub) — `lib/payments.ts`, `lib/payment-server.ts`
- **Email:** React Email + Resend API — `emails/`, `lib/email.ts`
- **State:** React Context + Zustand (chat store)
- **Data fetching:** SWR

## Project Structure

```
app/                    → Pages and API routes (Next.js App Router)
app/(app)/              → App pages: /home, /trips, /earnings, /profile, /notifications
app/api/rides/          → Ride posting (POST) and search (GET)
app/api/ride-requests/  → Passenger ride requests CRUD
app/api/announcements/  → Road announcements CRUD
app/api/notifications/  → Composite notification feed
app/api/payments/       → M-Pesa STK push, card initialize, status polling
components/             → All UI components (passenger, driver, shared)
components/shared/      → Reusable shared components (chat-launcher, payment-drawer, trip-card, etc.)
components/ui/          → Shadcn/UI primitives (50+ components)
emails/                 → React Email templates (welcome, payment receipt, trip confirmation)
lib/                    → Auth config, Supabase clients, RBAC, payments, email, utilities
lib/supabase/           → Supabase client/server/admin instances
hooks/                  → Custom React hooks (11 hooks)
supabase/migrations/    → Database schema migrations (6 files)
public/                 → Static assets
config.ts               → Centralized app config (features, limits, localization)
```

## App Modes

The app has two user roles with tab navigation:
home/Trips/Alerts/Profile
passanger mode/driver mode user can switch between modes via a toggle in splash screen page 

Mode is managed via `AppModeContext` in `app/context.tsx`. The splash screen (`KipitaSplash`) lets users choose "Join a Ride" or "Offer a Ride".

## Design System & Colors

All colors use the OKLch color space via CSS custom properties in `app/globals.css`. Fonts: Poppins (primary), Lexend (alt), Geist Mono (monospace).

### Brand Palette

| Token | OKLch Value | Hex Approx | Usage |
|---|---|---|---|
| `--brand-primary` | `0.378 0.073 169` | `#064e3b` | Deep forest green — buttons, headings |
| `--brand-secondary` | `0.786 0.064 148` | `#9ec5a2` | Sage green — secondary surfaces |
| `--brand-accent` | `0.601 0.132 162` | `#009867` | Vivid green — focus rings, glows, CTAs |

### Light Theme

| Token | OKLch Value | Role |
|---|---|---|
| `--background` | `0.985 0.01 155` | Near-white canvas with green tint |
| `--foreground` | `0.18 0.02 170` | Near-black text |
| `--card` | `0.992 0.008 155` | Card surface |
| `--accent` | `0.94 0.018 155` | Hover/selection surface |
| `--muted` | `0.965 0.012 155` | Muted backgrounds |
| `--destructive` | `0.577 0.245 27.325` | Error red |
| `--canvas` | `0.945 0.025 155` | Soft forest green page body |
| `--surface-low/surface/surface-high` | `0.965/0.955/0.935` | M3-inspired elevation hierarchy |
| `--border` | `0.93 0.01 155` | Subtle green-tinted borders |

### Dark Theme

| Token | OKLch Value | Role |
|---|---|---|
| `--background` | `0.15 0.005 0` | `#1a1a1a` charcoal base |
| `--foreground` | `0.95 0.005 0` | Near-white text |
| `--primary` | `0.72 0.14 155` | Vivid accent green (bright, punchy) |
| `--card` | `0.19 0.005 0` | `#252525` raised charcoal |
| `--accent` | `0.22 0.005 0` | `#2a2a2a` subtle lift |
| `--border` | `0.28 0.005 0` | `#3a3a3a` charcoal border |
| `--canvas` | `0.13 0.005 0` | `#1c1c1c` deep charcoal |
| `--ring` | `0.72 0.14 155` | Accent green focus ring |

### Shell Colors (RGB for native meta)

- **Light:** `--shell-top: 11 90 70`, `--shell-canvas: 215 227 221`, `--shell-bar: 223 233 227`, `--shell-nav: 243 247 244`
- **Dark:** `--shell-top: 7 47 38`, `--shell-canvas: 16 24 21`, `--shell-bar: 24 36 31`, `--shell-nav: 18 28 24`

### Utility Classes

| Class | Effect |
|---|---|
| `.app-backdrop` | Radial gradient with brand accent/primary on background |
| `.glass` | Frosted glass — 88% card + 10% accent, 14px blur |
| `.glass-card` | Premium glass card with brand-primary shadow, 1.25rem radius |
| `.soft-shadow` | Subtle shadow with brand-primary, hover lift |
| `.touch-target` | 3rem min-height/width for mobile tap targets |
| `.smooth-transition` | 300ms cubic-bezier(0.22, 1, 0.36, 1) |

### Design Tokens

- Border radius base: `0.9rem` → `--radius-sm` (calc -6px), `--radius-md` (-3px), `--radius-lg` (base), `--radius-xl` (+6px)
- Chart palette: 5 colors from brand family (green scale)
- Mobile-first layout capped at 430px width
- Dark/light theme via `next-themes`
- Material Design 3-inspired surface elevation tokens

## Core Features

### Authentication
- Google OAuth and email/password sign-in via NextAuth (JWT strategy)
- User registration: `POST /api/auth/signup`
- Phone verification: `/api/users/phone/start` and `/api/users/phone/verify` (Africa's Talking SMS OTP)
- Avatar upload: `/api/users/me/avatar`
- Password hashing with bcryptjs
- Welcome email sent on signup via Resend

### Driver — Post Rides (DB-persisted)
- **Post rides** with route, date/time, seats (1-4), price per seat (KES 500-10,000), and amenities — `driver-offer-ride.tsx`
- Form submits to `POST /api/rides` which inserts into `rides` table in Supabase
- Fields mapped: from→origin, to→destination, date+time→departure_time (ISO), seats→total_seats/available_seats, price→price_per_seat, pets→allows_pets, luggage→allows_packages
- Success animation shown after DB confirmation
- **Manage requests** (pending/accepted/rejected tabs) with accept/decline actions — `driver-requests.tsx`
- **Earnings dashboard** with monthly/all-time stats and recent activity — `driver-earnings.tsx`
- **Driver profile** with verification status — `driver-profile-drawer.tsx`

### Passenger — Search & Book Rides (DB-backed)
- **Search rides** with from/to location autocomplete (50+ Kenyan towns from `lib/kenyan-towns.ts`), date, seat count, and preferences (pets, luggage) — `passenger-search.tsx`, `PassengerSearchForm.tsx`
- Search calls `GET /api/rides?from=X&to=Y&date=Z&seats=N&pets=true&luggage=true` which queries real DB
- **Today's rides carousel** fetches live rides from `GET /api/rides?date=today` with fallback to sample data
- **Browse results** with driver name/image (joined from users table), pricing, and seats left — `RideResults.tsx`
- **View ride details** and request seats or message driver — `ride-details.tsx`
- **Post ride request** when no rides found — button in RideResults calls `POST /api/ride-requests`
- **Track requests** fetched from `GET /api/ride-requests` (real DB data) — `my-rides.tsx`

### Payment Flow (Stub — awaiting production integration)
- **Payment drawer** (`components/shared/payment-drawer.tsx`) — user selects M-Pesa or Card
- **M-Pesa flow:** Client calls `POST /api/payments/mpesa/stk-push` → server generates checkout ID → client polls `GET /api/payments/mpesa/status` → confirms payment
- **Card flow:** Client calls `POST /api/payments/card/initialize` → server generates reference → confirms payment
- **Server-side confirmation** (`lib/payment-server.ts`): creates booking, deducts seats, creates payment record (status: "held"), sends receipt + trip confirmation emails
- Platform fee: 10% held, 90% to driver
- **Production TODOs:** Replace stubs with Safaricom Daraja (M-Pesa) and Stripe/Paystack (card), wire callback webhooks

### Email Notifications (React Email + Resend)
- **Welcome email** (`emails/WelcomeEmail.tsx`) — sent on signup, role-specific copy (passenger vs driver)
- **Payment receipt** (`emails/PaymentReceiptEmail.tsx`) — amount, method, reference, ride ID, "Asante sana" message
- **Trip confirmation** (`emails/TripConfirmationEmail.tsx`) — origin, destination, departure, driver name, seat count, "Safari njema" message
- **Shared layout** (`emails/components/EmailLayout.tsx`) — Kipita branding, header, body, footer
- Sending via `lib/email.ts` using Resend API (requires `RESEND_API_KEY`). Falls back to console.info if not configured.

### Road Announcements (DB-persisted)
- **Anyone can post** road condition updates (traffic, protests, roadblocks, etc.)
- Posts saved to `announcements` table via `POST /api/announcements`
- Auto-severity classification via `lib/notification-priority.ts` — regex-based (critical/warning/info)
- Announcements appear in the notifications feed for all users

### Notifications (Real-time feed)
- **Composite feed** from `GET /api/notifications` — merges recent rides (last 48h) + announcements into unified `Notice[]`
- Polls every 30 seconds for new data
- Rides appear as "ride" notifications with driver name, price, seats
- Announcements appear with poster name and severity level
- Client-side filtering by kind (ride/announcement/system), severity, read status
- Search across notification title, body, location, route
- Mark read/unread per notification or bulk mark-all-read

### Chat / Messaging
- Zustand-based state management (`ChatStore` in `global-chat.tsx`)
- Trip state awareness (not_started, started, completed, cancelled — cannot chat when completed/cancelled)
- Unread count tracking per thread per driver
- **Chat launcher** (`components/shared/chat-launcher.tsx`) — FAB button with unread badge, fixed bottom-right
- Chat accessible from ride details and request management

### Ride Request Matching
- When driver accepts a passenger request → fills `ride_requests.matched_driver_id`, `matched_ride_id`, `matched_at`
- Stores `match_price_per_seat` and `match_departure_time` for audit
- Drivers can browse `/api/ride-requests` to find unmatched requests on their route
- No automatic matching algorithm yet — all manual accept/decline

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

Additional migrations:

| Migration | Changes |
|---|---|
| `20260412_ride_request_match_tracking.sql` | Adds `matched_driver_id`, `matched_at` to `ride_requests` |
| `20260413_ride_request_preferred_time.sql` | Adds `preferred_time` to `ride_requests` |
| `20260412000100_ride_request_matched_ride.sql` | Adds `matched_ride_id`, `match_price_per_seat`, `match_departure_time` to `ride_requests` |

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/signup` | POST | User registration + welcome email |
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
| `/api/payments/mpesa/stk-push` | POST | Initiate M-Pesa STK push (stub) |
| `/api/payments/mpesa/status` | GET | Poll M-Pesa payment status |
| `/api/payments/card/initialize` | POST | Initialize card payment (stub) |

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

## Shared Components

| Component | File | Purpose |
|---|---|---|
| Chat Launcher | `components/shared/chat-launcher.tsx` | FAB button with unread badge |
| Payment Drawer | `components/shared/payment-drawer.tsx` | M-Pesa/Card selection + checkout |
| Trip Card | `components/shared/trip-card.tsx` | Ride summary card |
| Person Sheet | `components/shared/person-sheet.tsx` | User profile bottom sheet |
| Bottom Drawer | `components/shared/bottom-drawer.tsx` | Reusable bottom drawer |
| Town Autocomplete | `components/shared/town-autocomplete.tsx` | Kenyan towns typeahead |
| Alert Card | `components/shared/alert-card.tsx` | Alert/announcement display |
| Empty State | `components/shared/empty-state.tsx` | Empty state placeholder |

## UI System

- `ui-parts.tsx` — Custom components: Surface, BottomSheet, PillButton, ChipToggle, LocationInput, DatePickerCard, ShimmerCard, MapPreview
- Material Design 3-inspired surface tokens (base, raised, sheet, panel)
- Dark/light theme via `next-themes`
- Mobile-first layout capped at 430px width

## Custom Hooks

| Hook | Purpose |
|---|---|
| `use-auth.ts` | `useAuth()`, `useProtectedRoute()`, `useHasRole()`, `useHasAnyRole()` |
| `use-role-config.ts` | Role-specific UI config (labels, endpoints, placeholders) |
| `use-mobile.ts` | Mobile viewport detection |
| `use-toast.ts` | Toast notifications |
| `use-debounce.ts` | Debounced values |
| `use-auth-guard.ts` | Auth guard redirect |
| `use-auto-carousel.ts` | Auto-advancing carousel |
| `use-app-preferences.ts` | App preferences (theme, language) |
| `use-back-navigation.ts` | Back button navigation |
| `use-town-suggestions.ts` | Town autocomplete suggestions |
| `use-place-suggestions.ts` | Place autocomplete suggestions |

## Lib Utilities

| File | Purpose |
|---|---|
| `lib/email.ts` | Resend API: `sendWelcomeEmail()`, `sendPaymentReceipt()`, `sendTripConfirmation()` |
| `lib/payment-server.ts` | `confirmRidePayment()` — booking + seat deduction + payment record + emails |
| `lib/payments.ts` | Client-side: `initiateMpesaPayment()`, `pollMpesaStatus()`, `initiateCardPayment()` |
| `lib/notification-priority.ts` | `classifyRoadUpdate()` — severity classification via regex |
| `lib/rbac.ts` / `lib/rbc.ts` | `hasRole()`, `isDriver()`, `isPassenger()`, `isAdmin()` |
| `lib/role-config.ts` | Role-based UI config (passenger vs driver labels, endpoints) |
| `lib/constants.ts` | `APP_NAME`, `CURRENCY`, `LIMITS`, `RIDE_STATUSES`, `NOTICE_KINDS` |
| `lib/formatters.ts` | `initials()`, `formatDate()`, `formatTime()`, `timeAgo()`, `formatPrice()` |
| `lib/kenyan-towns.ts` | 50+ Kenyan towns for autocomplete |
| `lib/kenyan-places.ts` | Extended places data |
| `lib/validators.ts` | Zod schemas for form validation |
| `lib/auth.ts` | NextAuth config (`authOptions`) |
| `lib/swr-config.ts` | SWR global config |
| `lib/utils.ts` | `cn()` classname merge utility |
| `lib/types.ts` | Shared TypeScript types |

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Environment Variables

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme_super_secret

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Africa's Talking (SMS OTP)
AT_USERNAME=
AT_API_KEY=

# Resend (Email)
RESEND_API_KEY=
```

## Key Config

`config.ts` contains:
- **Feature flags:** darkMode, notifications, messaging, reviews (enabled); realTimeTracking, paymentIntegration, verification, socialSharing (disabled)
- **Limits:** seats 1-4, price KES 500-10,000, message 280 chars
- **Pricing:** KES currency, 10% platform fee, KES 50/km default
- **Localization:** English/Swahili, Africa/Nairobi timezone
- **Ride statuses:** posted, in_progress, completed, cancelled
- **Refresh intervals:** search 30s, messages 5s, ride status 10s
- **Feature flags (v2):** enableLiveTracking, enablePayments, enableSocialLogin, enablePhoneVerification, enableEmailVerification, enableCarpoolingTips (enabled), enableReferralProgram, enableInsurance

## Data Flow Summary

1. **Driver posts ride** → `driver-offer-ride.tsx` → `POST /api/rides` → `rides` table → appears in passenger search + notifications
2. **Passenger searches** → `passenger-search.tsx` → `GET /api/rides` → real DB results with driver info
3. **No results → auto-post request** → `RideResults.tsx` → `POST /api/ride-requests` → `ride_requests` table → visible to drivers in notifications
4. **Driver accepts request** → updates `ride_requests.matched_driver_id`, `matched_ride_id` → passenger notified
5. **Passenger pays** → `payment-drawer.tsx` → M-Pesa STK push or Card → `confirmRidePayment()` → creates booking, deducts seats, creates payment record → sends payment receipt + trip confirmation emails
6. **Road announcement** → `messages-screen.tsx` → `POST /api/announcements` → `announcements` table → severity auto-classified → appears in notifications feed
7. **Notifications** → `messages-screen.tsx` → `GET /api/notifications` → polls every 30s → merges rides + announcements
8. **Chat** → `global-chat.tsx` → Zustand store → trip-aware messaging between driver and passenger
9. **Signup** → `POST /api/auth/signup` → user created → welcome email sent via Resend
