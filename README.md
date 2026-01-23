# RideShare - Carpool MVP

A modern, minimal carpool app built with Next.js, Tailwind CSS, and React. Designed with a mobile-first approach featuring glassmorphism, soft UI, micro-interactions, and adaptive theming.

## 🎨 Design Philosophy

**Keywords:** Minimal • Calm • Trust-building • Community-driven • Fast to understand

This is NOT a taxi app. It's "People already going the same way — let's share."

## 🏗️ Architecture

### App Structure
- **Splash Screen** - Welcome & mode selection (Passenger or Driver)
- **Top Navigation** - Title and back button (sticky)
- **Bottom Navigation** - Tab-based navigation (4 items max)
- **Main Content Area** - Dynamic content based on active tab

### State Management
- `app/context.tsx` - App-level state using React Context
- Global mode: `'splash' | 'passenger' | 'driver'`
- Active tab tracking per mode

## 📱 Screens

### Passenger Mode
1. **Search** - Find rides with filters
   - From/To locations
   - Date & time
   - Seat count
   - Preferences (pets, luggage, airport)
2. **Trips** - View upcoming and past rides
3. **Messages** - Chat with drivers/passengers
4. **Profile** - User info and settings

### Driver Mode
1. **My Rides** - Post and manage rides
   - Offer a new ride form
   - View posted rides
2. **Requests** - Manage passenger requests
   - Accept/decline requests
   - View confirmed passengers
3. **Earnings** - Track income
   - This month & all-time earnings
   - Recent activity log
4. **Profile** - User info and settings

## 🎯 Key Features

### Design Elements
- **Glassmorphism** - Frosted glass panels with blur & transparency
- **Soft UI** - Subtle shadows and soft highlights
- **Micro-interactions** - Smooth transitions on every action
- **Mobile-first** - Optimized for touch with large target areas (min 48px)
- **Adaptive Theming** - Light and dark mode with muted colors

### Modular Components
- `SplashScreen` - Animated welcome
- `TopNav` - Fixed sticky navigation
- `BottomNav` - Tab-based navigation
- `PassengerSearch` - Ride search form
- `RideCard` - Individual ride display
- `DriverOfferRide` - Ride posting form
- `DriverRequests` - Request management
- `MessagesScreen` - Chat interface
- `ProfileScreen` - User profile
- `DriverEarnings` - Earnings dashboard
- `MyRides` - Trip history

## 🎨 Color System (3 Colors Maximum)

### Light Theme
- **Primary (Teal):** `oklch(0.5 0.15 160)` - Trust, safety, travel
- **Neutral (Off-white):** `oklch(0.98 0.001 240)` - Backgrounds
- **Accent (Warm amber):** `oklch(0.62 0.2 45)` - Alerts, highlights

### Dark Theme
- **Primary:** Lighter teal for visibility
- **Neutral:** Dark slate backgrounds
- **Accent:** Brighter warm tones

## 📚 Typography

- **Font:** Poppins (system-ui fallback)
- **Weights:** 300, 400, 500, 600, 700
- **Usage:**
  - Headings: Semi-bold (600, 700)
  - Body: Regular (400)
  - Emphasis: Medium (500)

## 🚀 Getting Started

### Installation
```bash
npm install
# or
yarn install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build
```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State:** React Context + useState
- **Font:** Google Fonts (Poppins)

## 📖 Component Usage

### Splash Screen
```tsx
<SplashScreen />
// User selects passenger or driver mode
```

### Passenger Search
```tsx
<PassengerSearch 
  onSearch={(filters) => console.log(filters)}
  showResults={true}
/>
```

### Ride Card
```tsx
<RideCard
  driverName="James K."
  rating={4.8}
  from="Nanyuki"
  to="Nairobi"
  startTime="7:00 AM"
  endTime="8:00 AM"
  price={1200}
  seatsLeft={2}
  onJoin={() => console.log('Joined!')}
/>
```

## 🎯 MVP Features Included

✅ Splash screen with animated intro
✅ Mode selection (Passenger/Driver)
✅ Ride search with filters
✅ Ride results with join functionality
✅ Driver ride posting form
✅ Request management with accept/decline
✅ Messages with quick actions
✅ User profiles with stats
✅ Earnings tracking for drivers
✅ Trip history for passengers
✅ Bottom navigation with 4 tabs per mode
✅ Top navigation with back button
✅ Mobile-optimized layout
✅ Dark mode support
✅ Glassmorphism & soft UI effects
✅ Micro-interactions & smooth transitions

## 🚀 Future Enhancements

- Real maps integration (Google Maps API)
- Live tracking during rides
- Payment processing (Stripe)
- Real chat messaging backend
- Driver verification system
- Rating & review system
- Ride history export
- Advanced filtering options
- Push notifications
- Social sharing

## 📝 Notes

- All data is mocked for MVP purposes
- No backend API integration yet
- Ready for database/API layer integration
- Component structure supports easy data binding
- Fully responsive mobile-first design
- Accessibility features included (ARIA labels, semantic HTML)

## 🎓 Design System Principles

1. **Clarity over beauty** - Function first
2. **Trust-first design** - Banking app aesthetic
3. **Calm interactions** - No flashy animations
4. **Mobile-native** - Thumb-reachable buttons
5. **Consistent** - Predictable patterns throughout
6. **Accessible** - WCAG compliant

---

Built with v0 for Vercel. Modern, minimal, and ready to scale.
