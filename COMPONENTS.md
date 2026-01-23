# RideShare Component Library

Complete documentation of all reusable components in the RideShare MVP.

## Core Layout Components

### TopNav
**File:** `components/top-nav.tsx`

Fixed sticky navigation bar with back button and title.

```tsx
<TopNav title="Find a Group Ride" />
```

**Props:**
- `title: string` - Page title to display

**Features:**
- Glassmorphic design
- Back button for navigation
- Menu icon placeholder
- Sticky positioning

---

### BottomNav
**File:** `components/bottom-nav.tsx`

Fixed bottom tab navigation with 4 items (passenger or driver).

```tsx
<BottomNav
  mode="passenger"
  activeTab="search"
  onTabChange={(tab) => setActiveTab(tab)}
/>
```

**Props:**
- `mode: 'passenger' | 'driver'` - User mode
- `activeTab: string` - Currently active tab ID
- `onTabChange: (tab: string) => void` - Tab change handler

**Features:**
- Auto-switches between passenger and driver tabs
- Smooth animations on selection
- Touch-friendly target sizes

---

## Screen Components

### SplashScreen
**File:** `components/splash-screen.tsx`

Welcome screen with animated car icon and mode selection.

```tsx
<SplashScreen />
```

**Features:**
- Animated car illustration
- Gradient heading
- Two CTA buttons (Join/Offer)
- Trust-building messaging

---

### PassengerSearch
**File:** `components/passenger-search.tsx`

Search form for finding rides with filters.

```tsx
<PassengerSearch
  showResults={false}
  onSearch={(filters) => console.log(filters)}
/>
```

**Props:**
- `onSearch?: (filters: SearchFilters) => void` - Search callback
- `showResults?: boolean` - Show results state

**Features:**
- From/To location inputs
- Date picker
- Seat count selector (1-4)
- Toggle options (pets, luggage, airport)
- Large search button

---

### RideCard
**File:** `components/ride-card.tsx`

Individual ride result card with driver info and booking.

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

**Props:**
- `driverName: string` - Driver's name
- `rating: number` - Driver rating (0-5)
- `from: string` - Starting location
- `to: string` - Destination
- `startTime: string` - Departure time
- `endTime: string` - Arrival time
- `price: number` - Price per seat (KES)
- `seatsLeft: number` - Available seats
- `onJoin?: () => void` - Join callback

**Features:**
- Driver avatar with initials
- Star rating display
- Route information
- Price and seats display
- Join button with state tracking
- Soft shadows and hover effects

---

### DriverOfferRide
**File:** `components/driver-offer-ride.tsx`

Form for posting a new ride.

```tsx
<DriverOfferRide
  onSubmit={(form) => console.log(form)}
/>
```

**Props:**
- `onSubmit?: (form: OfferRideForm) => void` - Form submission

**Features:**
- From/To location inputs
- Date picker
- Departure and arrival time
- Available seats selector (1-4)
- Price per seat input
- Amenity toggles (pets, luggage, airport)
- Success state with 2-second reset

---

### DriverRequests
**File:** `components/driver-requests.tsx`

Manage pending and accepted passenger requests.

```tsx
<DriverRequests />
```

**Features:**
- Pending requests section with accept/decline
- Accepted passengers section
- Passenger ratings and seat counts
- Accept/reject actions
- Status indicators

---

### MessagesScreen
**File:** `components/messages-screen.tsx`

Chat interface with conversation list and messaging.

```tsx
<MessagesScreen />
```

**Features:**
- Conversation list
- Message thread display
- Quick action buttons
  - "I'm on my way"
  - "Running 5 mins late"
  - "Arrived"
- Input field for custom messages
- Unread indicators

---

### ProfileScreen
**File:** `components/profile-screen.tsx`

User profile with stats and settings.

```tsx
<ProfileScreen userMode="passenger" />
```

**Props:**
- `userMode: 'passenger' | 'driver'` - User mode

**Features:**
- User avatar with initials
- Name and rating display
- Stats grid (trips, months, reliability)
- Contact information
- Settings and logout buttons

---

### DriverEarnings
**File:** `components/driver-earnings.tsx`

Earnings dashboard for driver mode.

```tsx
<DriverEarnings />
```

**Features:**
- This month earnings card
- All-time earnings card
- Recent activity list
- Pro tip section
- Trending indicators

---

### MyRides
**File:** `components/my-rides.tsx`

Trip history for passenger mode.

```tsx
<MyRides />
```

**Features:**
- Upcoming rides section
- Past rides section
- Ride details (time, passengers, price)
- Driver info display
- Empty state

---

## Utility Components

### EmptyState
**File:** `components/empty-state.tsx`

Reusable empty state display component.

```tsx
<EmptyState
  icon={<MapIcon className="w-8 h-8" />}
  title="No Rides Yet"
  description="Search and join your first ride"
  action={{
    label: "Search Rides",
    onClick: () => navigate('/search')
  }}
/>
```

**Props:**
- `icon?: ReactNode` - Icon to display
- `title: string` - Heading text
- `description: string` - Description text
- `action?: { label: string; onClick: () => void }` - Optional action button

---

### StateFeedback
**File:** `components/state-feedback.tsx`

Displays loading, success, error, or info states.

```tsx
<StateFeedback
  state="success"
  title="Ride Joined!"
  message="You're all set for your trip"
/>
```

**Props:**
- `state: 'loading' | 'success' | 'error' | 'info'` - State type
- `title: string` - Heading
- `message: string` - Description

**States:**
- **loading** - Blue spinner
- **success** - Green checkmark
- **error** - Red alert icon
- **info** - Blue info icon

---

## Context & Hooks

### AppContext
**File:** `app/context.tsx`

Global app state for mode selection.

```tsx
const { mode, setMode } = useAppMode()
// mode: 'splash' | 'passenger' | 'driver'
// setMode: (mode: UserMode) => void
```

**Usage:**
```tsx
import { useAppMode } from '@/app/context'

function MyComponent() {
  const { mode, setMode } = useAppMode()
  
  return (
    <button onClick={() => setMode('passenger')}>
      Switch to Passenger
    </button>
  )
}
```

---

## Styling & Utilities

### Global Classes

**Glassmorphism:**
```css
.glass - Frosted glass with blur
.glass-card - Glass panel with padding and rounded corners
```

**Shadows & Effects:**
```css
.soft-shadow - Subtle shadow with hover effect
.soft-ui - Gradient with inset shadow
```

**Interactions:**
```css
.touch-target - min-h-12 min-w-12 for touch friendly
.smooth-transition - Smooth 300ms transitions
.focus-ring - Focus states with ring
```

---

## Typography

All components use the **Poppins** font family with consistent sizing:

- **Headings:** 700 weight (bold)
- **Subheadings:** 600 weight (semibold)
- **Body:** 400 weight (regular)
- **Emphasis:** 500 weight (medium)
- **Captions:** 400 weight with muted color

---

## Colors

### Theme Tokens

**Light Mode:**
- `--foreground` - Text color
- `--background` - Page background
- `--card` - Card background
- `--primary` - Teal (actions, highlights)
- `--accent` - Warm amber (alerts)
- `--muted` - Grayed out

**Dark Mode:**
- Colors adjust automatically via `.dark` class
- Maintains contrast ratios
- All components are dark-mode ready

---

## Responsive Design

All components follow **mobile-first** design:

- Base styles for mobile
- `md:` breakpoint for tablets (768px+)
- `lg:` breakpoint for desktop (1024px+)
- Touch targets minimum 48px²
- Padding scales appropriately

---

## Accessibility

All components include:

- Semantic HTML elements
- ARIA labels on buttons
- Focus rings for keyboard navigation
- Color contrast ratios ≥ 4.5:1
- Screen reader support
- Proper heading hierarchy

---

## Best Practices

1. **Wrap in AppProvider** - Ensure AppContext is available
2. **Use composition** - Build pages from components
3. **Handle states** - Loading, success, error states
4. **Mobile-first** - Design for mobile then scale up
5. **Consistent spacing** - Use Tailwind scale (gap-4, p-6, etc.)
6. **Micro-interactions** - Add feedback to every action
7. **Clear hierarchy** - Use typography scales
8. **Touch-friendly** - Buttons min 48px, spacing ≥16px

---

## Examples

### Passenger Search Flow
```tsx
<div>
  <TopNav title="Find a Group Ride" />
  <PassengerSearch
    onSearch={(filters) => {
      // Fetch rides matching filters
      setResults(true)
    }}
  />
  {results && mockRides.map(ride => <RideCard {...ride} />)}
  <BottomNav mode="passenger" activeTab="search" />
</div>
```

### Driver Offer Flow
```tsx
<div>
  <TopNav title="Offer a Ride" />
  <DriverOfferRide
    onSubmit={(form) => {
      // Post ride to backend
    }}
  />
  <BottomNav mode="driver" activeTab="rides" />
</div>
```

---

## Component Tree

```
App
├── AppProvider (context)
│   └── AppContent
│       ├── SplashScreen (splash mode)
│       │   └── Button x2
│       └── MainApp
│           ├── TopNav
│           ├── Content (varies by activeTab)
│           │   ├── PassengerSearch + RideCard
│           │   ├── DriverOfferRide
│           │   ├── DriverRequests
│           │   ├── MessagesScreen
│           │   ├── DriverEarnings
│           │   ├── ProfileScreen
│           │   └── MyRides
│           └── BottomNav
```

---

For questions or improvements, refer to the main README.md and component source files.
