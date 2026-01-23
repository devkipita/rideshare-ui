# RideShare MVP - Quick Start Guide

Get started with the RideShare carpool MVP in 5 minutes.

## 🚀 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup Steps

1. **Clone/Open the Project**
```bash
cd rideshare-mvp
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open in Browser**
```
http://localhost:3000
```

You should see the animated splash screen!

---

## 🎯 First Look

### Splash Screen
- **Title:** "Share the road. Split the cost."
- **Buttons:** "Join a Group Ride" and "Offer a Ride"
- **Click either button** to enter the app

### Passenger Mode
Click "Join a Group Ride"
- **Search Tab:** Find rides
- **Trips Tab:** View your bookings
- **Messages Tab:** Chat with drivers
- **Profile Tab:** User settings

### Driver Mode
Click "Offer a Ride"
- **My Rides Tab:** Post new rides
- **Requests Tab:** Manage bookings
- **Earnings Tab:** Track income
- **Profile Tab:** User settings

---

## 📁 Project Structure

```
rideshare-mvp/
├── app/
│   ├── page.tsx              # Main app page
│   ├── layout.tsx            # Root layout with Poppins font
│   ├── globals.css           # Global styles + theming
│   └── context.tsx           # App state management
│
├── components/
│   ├── splash-screen.tsx     # Welcome screen
│   ├── top-nav.tsx           # Header navigation
│   ├── bottom-nav.tsx        # Tab navigation
│   │
│   ├── passenger-search.tsx  # Ride search form
│   ├── ride-card.tsx         # Individual ride display
│   ├── my-rides.tsx          # Trip history
│   │
│   ├── driver-offer-ride.tsx # Post ride form
│   ├── driver-requests.tsx   # Manage requests
│   ├── driver-earnings.tsx   # Earnings dashboard
│   │
│   ├── messages-screen.tsx   # Chat interface
│   ├── profile-screen.tsx    # User profile
│   │
│   ├── empty-state.tsx       # Empty state component
│   ├── state-feedback.tsx    # Loading/success/error
│   └── ui/                   # shadcn/ui components
│
├── lib/
│   └── utils.ts              # Utility functions (cn)
│
├── README.md                 # Main documentation
├── COMPONENTS.md             # Component library docs
├── DESIGN_SYSTEM.md          # Design system guide
└── QUICKSTART.md             # This file
```

---

## 🎨 Understanding the Design

### Color Scheme (3 Colors)
1. **Teal (#4CAF50ish)** - Primary actions, search, join buttons
2. **Off-white (#F7F8FA)** - Backgrounds
3. **Warm Amber (#F59E0B)** - Alerts, highlights

### Modern Effects
- **Glassmorphism:** Frosted glass panels with blur
- **Soft UI:** Subtle shadows and gradients
- **Micro-interactions:** Smooth 300ms transitions

### Mobile-First
- Touch targets minimum 48px × 48px
- Optimized for thumbs
- Gesture-driven (tap, swipe)

---

## 📝 Common Tasks

### How to Add a New Screen

1. **Create component file:**
```tsx
// components/my-new-screen.tsx
export function MyNewScreen() {
  return (
    <div className="space-y-4">
      {/* Content here */}
    </div>
  )
}
```

2. **Import in page.tsx:**
```tsx
import { MyNewScreen } from '@/components/my-new-screen'
```

3. **Add to active tab logic:**
```tsx
{activeTab === 'new-tab' && <MyNewScreen />}
```

4. **Add tab to bottom nav in bottom-nav.tsx:**
```tsx
const tabs = [
  { id: 'new-tab', label: 'New', icon: NewIcon },
  // ...
]
```

### How to Customize Colors

Edit `/app/globals.css`:

```css
:root {
  --primary: oklch(0.5 0.15 160);    /* Change this */
  --accent: oklch(0.62 0.2 45);      /* Or this */
  /* ... */
}
```

Or use Tailwind classes directly:
```tsx
<button className="bg-blue-500 text-white">Click me</button>
```

### How to Add State Management

Use React Context (already set up):

```tsx
// app/context.tsx
export function AppProvider({ children }) {
  const [rides, setRides] = useState([])
  
  return (
    <AppContext.Provider value={{ rides, setRides }}>
      {children}
    </AppContext.Provider>
  )
}

// In components:
const { rides, setRides } = useAppContext()
```

---

## 🧩 Using Components

### Copy-Paste Examples

**Search for Rides:**
```tsx
<PassengerSearch
  onSearch={(filters) => console.log(filters)}
/>
```

**Display a Ride:**
```tsx
<RideCard
  driverName="John D."
  rating={4.8}
  from="Nanyuki"
  to="Nairobi"
  startTime="7:00 AM"
  endTime="8:00 AM"
  price={1200}
  seatsLeft={2}
  onJoin={() => alert('Joined!')}
/>
```

**Show Empty State:**
```tsx
<EmptyState
  title="No Rides"
  description="Search to find available rides"
  icon={<MapIcon className="w-8 h-8" />}
/>
```

**Show Loading:**
```tsx
<StateFeedback
  state="loading"
  title="Finding rides..."
  message="Please wait"
/>
```

---

## 🎯 Navigation Flow

```
Splash Screen
    ↓
┌───────────────────────────────┐
│                               │
│   Join a Group Ride           │   Offer a Ride
│        (Passenger)            │      (Driver)
│                               │
└───────────────────────────────┘
    ↓                               ↓
    
PASSENGER MODE              DRIVER MODE
├─ Search                   ├─ My Rides
├─ Trips                    ├─ Requests
├─ Messages                 ├─ Earnings
└─ Profile                  └─ Profile

Back to Splash anytime from top nav
```

---

## 🔄 Data Flow

Currently, all data is **mocked**. To add real data:

1. **Replace mock arrays:**
```tsx
// Before:
const mockRides = [{...}]

// After:
const { rides } = useFetchRides()  // From API
```

2. **Add API calls:**
```tsx
const { rides, loading } = useFetchRides()

if (loading) return <StateFeedback state="loading" />
if (!rides.length) return <EmptyState />

return rides.map(ride => <RideCard {...ride} />)
```

3. **Connect to backend:**
- Replace context with state management (Redux, Zustand, etc.)
- Add API client (fetch, axios, etc.)
- Implement authentication

---

## 🌙 Dark Mode

Dark mode is **automatically supported**:

1. Light mode uses default colors
2. Dark mode uses `.dark` class variant colors
3. Users' system preference is respected
4. All components are dark-mode ready

**To test dark mode:**
- Open DevTools
- Search: "color scheme" or "dark"
- Select dark mode
- Page auto-updates

---

## 📱 Responsive Design

The app works on all screen sizes:

- **Mobile (< 640px):** Full width, optimized
- **Tablet (640-1024px):** Centered, wider padding
- **Desktop (> 1024px):** Max-width container

Test responsiveness:
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select different device sizes
4. Everything stays functional

---

## 🚨 Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Styles not loading
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript errors
```bash
# Rebuild
npm run build
```

### Git issues
```bash
# Reset to clean state
git clean -fd
git reset --hard
```

---

## 🎓 Learning Resources

### Inside This Project
- **README.md** - Full documentation
- **COMPONENTS.md** - Component library guide
- **DESIGN_SYSTEM.md** - Design philosophy & patterns

### External Resources
- [Next.js 16 Docs](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

## ✅ Checklist for Next Steps

After exploring the MVP:

- [ ] Read the full README.md
- [ ] Explore the component library (COMPONENTS.md)
- [ ] Understand the design system (DESIGN_SYSTEM.md)
- [ ] Test all screens (passenger & driver modes)
- [ ] Check dark mode
- [ ] Test on mobile device (responsive)
- [ ] Review the component structure
- [ ] Plan database schema for real data
- [ ] Design API endpoints
- [ ] Set up authentication
- [ ] Connect to database
- [ ] Replace mock data with API calls

---

## 🚀 Ready to Deploy?

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel
```

Or connect your GitHub repo to Vercel for auto-deploy.

---

## 💡 Pro Tips

1. **Use Tailwind Classes** - Don't write CSS, use Tailwind
2. **Copy Components** - All components are composable
3. **Check Dark Mode** - Always test both light and dark
4. **Mobile First** - Design for mobile, enhance for desktop
5. **Use States** - Show loading, success, error, empty states
6. **Keep It Calm** - No unnecessary animations
7. **Trust First** - Like a bank, not a game
8. **Consistency** - Use same spacing, colors, patterns

---

## 📞 Support

- Check README.md for architecture details
- Check COMPONENTS.md for API reference
- Check DESIGN_SYSTEM.md for design guidelines
- Review component source code for examples

---

**Happy coding! 🎉**

Start with the splash screen, then explore passenger mode, driver mode, and all the interactive features. The whole MVP is ready to use and customize.
