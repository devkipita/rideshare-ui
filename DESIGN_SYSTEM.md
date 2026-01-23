# RideShare Design System

Complete design system documentation for the RideShare MVP carpool app.

## 🎨 Design Philosophy

**Keywords:** Minimal • Calm • Trust-building • Community-driven • Fast to understand

The RideShare app is designed to feel like a **bank or fintech app**, not a flashy startup. Every element is intentional, clear, and trustworthy.

---

## 📐 Color System

### Core Colors (Maximum 3)

#### Light Mode
| Color | Purpose | Token | Value |
|-------|---------|-------|-------|
| **Teal** | Primary actions, trust | `--primary` | `oklch(0.5 0.15 160)` |
| **Off-white** | Backgrounds, neutral | `--background` | `oklch(0.98 0.001 240)` |
| **Warm Amber** | Alerts, highlights | `--accent` | `oklch(0.62 0.2 45)` |

#### Dark Mode
| Color | Purpose | Token | Value |
|-------|---------|-------|-------|
| **Light Teal** | Primary actions | `--primary` | `oklch(0.55 0.15 160)` |
| **Dark Slate** | Backgrounds | `--background` | `oklch(0.15 0.01 240)` |
| **Bright Amber** | Alerts, highlights | `--accent` | `oklch(0.65 0.2 45)` |

### Supporting Colors

```
--foreground: Text color (dark in light, light in dark)
--card: Card backgrounds (white in light, dark slate in dark)
--muted: Disabled, secondary states
--border: Dividers and borders
--destructive: Errors and warnings (red)
```

### Why 3 Colors?

1. **Reduces cognitive load** - Users know what each color means
2. **Improves accessibility** - Fewer color variations = better contrast
3. **Maintains calm aesthetic** - Avoids visual chaos
4. **Professional appearance** - Banking/fintech standard
5. **Easy theming** - Consistent light/dark mode

---

## 🔤 Typography

### Font Family
- **Primary:** Poppins (Google Fonts)
- **Fallback:** system-ui, sans-serif
- **No decorative fonts** - clarity is priority

### Font Weights
- **300** - Light (rarely used)
- **400** - Regular (body text)
- **500** - Medium (emphasis within body)
- **600** - Semibold (subheadings)
- **700** - Bold (main headings)

### Scale & Usage

```
Heading 1 (H1)
- Size: 32-36px (2xl)
- Weight: 700 (bold)
- Use: Page titles, splash screen

Heading 2 (H2)
- Size: 28-32px (xl)
- Weight: 600 (semibold)
- Use: Section titles, card titles

Heading 3 (H3)
- Size: 20-24px (lg)
- Weight: 600 (semibold)
- Use: Subsection titles

Body Large
- Size: 16px (base)
- Weight: 400 (regular)
- Use: Main content, descriptions

Body Normal
- Size: 14px (sm)
- Weight: 400 (regular)
- Use: Secondary text, labels

Body Small
- Size: 12px (xs)
- Weight: 400 (regular)
- Use: Captions, metadata

Label
- Size: 14px (sm)
- Weight: 600 (semibold)
- Use: Form labels, button text

Caption
- Size: 12px (xs)
- Weight: 500 (medium)
- Use: Hints, metadata
```

### Line Height
- **Display text:** 1.2 (tight)
- **Body text:** 1.5-1.6 (relaxed)
- **Input text:** 1.5

---

## 🎭 Visual Effects

### Glassmorphism
Modern, premium aesthetic with frosted glass panels.

```css
/* .glass */
background: white/80 (light mode)
            dark slate/80 (dark mode)
backdrop-filter: blur(12px)
border: white/30 (light)
        slate/30 (dark)
```

**When to use:**
- Navigation bars (top & bottom)
- Overlay panels
- Modal backdrops
- Premium card highlights

### Soft UI
Subtle shadows creating depth without harsh contrast.

```css
/* .soft-shadow */
box-shadow: 0 1px 2px rgba(0,0,0,0.05)   (light)
            0 2px 4px rgba(0,0,0,0.1)    (hover)

/* .soft-ui */
gradient: from white to gray-50 (light)
          from dark-slate to slate-900 (dark)
inset-shadow: white/20 (light)
              slate-600/20 (dark)
```

**When to use:**
- Card backgrounds
- Button states
- Input fields
- Hover states

### Micro-interactions
Smooth, predictable transitions with feedback.

```css
/* Standard transition */
transition: all 300ms ease-out

/* Specific properties */
.smooth-transition - Opacity, scale, shadow
.focus-ring - Focus states

/* Gesture feedback */
.hover:scale-105  - Gentle scale on hover
.active:scale-95  - Slight compress on click
```

**When to use:**
- Button interactions
- Tab changes
- State feedback
- Navigation changes

---

## 📐 Spacing System

All spacing follows Tailwind's scale (4px base unit):

```
gap-1 = 4px    gap-6 = 24px
gap-2 = 8px    gap-8 = 32px
gap-3 = 12px   gap-12 = 48px
gap-4 = 16px   gap-16 = 64px
```

### Layout Spacing
- **Container padding:** p-6 (24px) on mobile, p-8 (32px) on desktop
- **Section spacing:** mb-8 (32px)
- **Card spacing:** gap-3 (12px) internal, gap-4 (16px) external
- **Text spacing:** mb-2 (8px) for small, mb-4 (16px) for large

### Touch Targets
Minimum 48px × 48px for all interactive elements.

```css
.touch-target {
  min-height: 48px;
  min-width: 48px;
}
```

---

## 🔘 Component Patterns

### Buttons

**Primary Button**
```
Background: --primary (teal)
Text: --primary-foreground (white)
Padding: px-6 py-3 (24px × 12px)
Border-radius: rounded-full (pill shape)
Hover: scale-105
Active: scale-95
```

**Secondary Button**
```
Background: transparent
Border: 1px --border
Text: --foreground
Hover: bg-muted
```

**Icon Button**
```
Size: w-10 h-10 (40px)
Border-radius: rounded-full
Hover: bg-muted
```

### Cards

**Standard Card**
```
Background: --card (white/dark-slate)
Border-radius: rounded-2xl (16px)
Padding: p-6 (24px)
Shadow: soft-shadow (0 1px 2px)
Hover: shadow-lg
```

**Glass Card**
```
Background: glass (frosted white/slate)
Border-radius: rounded-2xl (16px)
Padding: p-6 (24px)
Shadow: soft-shadow
Backdrop: blur-lg
```

### Input Fields

```
Background: --input (light gray/dark slate)
Border: 1px --border
Border-radius: rounded-xl (12px)
Padding: px-4 py-3 (16px × 12px)
Focus: ring-2 ring-primary ring-offset-2
Transition: smooth-transition
```

### Form Groups

```
Label: text-sm font-medium --foreground
Spacing: gap-2
Input: full width, rounded-xl
Helper text: text-xs --muted-foreground
```

---

## 📱 Layout Structure

### Fixed Layout Pattern

```
┌─────────────────────────┐
│      TOP NAVIGATION     │ (sticky, h-16)
├─────────────────────────┤
│                         │
│   MAIN CONTENT AREA     │ (scroll, pb-32 for bottom nav)
│   (dynamic per tab)     │
│                         │
└─────────────────────────┘
├─────────────────────────┤
│  BOTTOM NAVIGATION      │ (fixed, h-20)
└─────────────────────────┘
```

### Container Widths
- **Mobile:** Full width (max-w-md for consistency)
- **Tablet:** Centered, max 640px
- **Desktop:** Centered, max 800px

### Safe Areas
- Content padding: 24px (p-6)
- Bottom nav offset: 80px (pb-20) on content
- Top nav offset: 64px (pt-16) or sticky

---

## 🎯 States & Feedback

### Loading State
```
Icon: Spinner (animate-spin)
Color: --primary (blue)
Background: --primary/20
Text: "Loading..." or custom message
Duration: Until complete
```

### Success State
```
Icon: CheckCircle
Color: green-600
Background: green-500/20
Text: Confirmation message
Duration: 2-3 seconds auto-close
```

### Error State
```
Icon: AlertCircle
Color: red-600
Background: red-500/20
Text: Error message with action
Duration: Until dismissed
```

### Empty State
```
Icon: Contextual (Map, Calendar, etc.)
Title: Clear action prompt
Description: Explanation
Action: Button to resolve
Background: Light card or plain
```

---

## 🌙 Dark Mode

### How It Works
- CSS custom properties change in `.dark` class
- Automatic via `prefers-color-scheme`
- All colors maintain contrast ratios
- No harsh whites or blacks

### Color Adjustments
- **Backgrounds:** Lighter in light mode, darker in dark
- **Text:** Dark text on light, light text on dark
- **Cards:** White/light gray → dark slate/charcoal
- **Borders:** Light gray → darker gray
- **Accents:** Maintained for visibility

### Testing
```
Light mode: FF4500 background = pass ✓
Dark mode: 1A1A1A background = pass ✓
WCAG AA contrast ratio: >4.5:1
```

---

## ✨ Micro-interactions

### Button Click
1. User clicks button
2. Button scales to 95% (`active:scale-95`)
3. Slight spring ease on release
4. Visual feedback with color/shadow

### Tab Selection
1. User taps tab
2. Icon scales to 110%
3. Tab bar highlights
4. Content smoothly transitions in

### Message Send
1. User types message
2. Input expands on focus
3. Send button highlights
4. Message animates in from bottom

### Ride Join
1. User taps "Join Ride"
2. Button changes to "Joined!" with checkmark
3. Color shifts to green
4. Subtle pulse animation

---

## 🎓 Best Practices

### Do's ✓
- Use consistent spacing (multiples of 4px)
- Keep interactions under 300ms
- Maintain minimum touch targets (48px)
- Test light and dark modes
- Use semantic colors (success=green, error=red)
- Provide feedback for every action
- Use smooth easing (ease-out, ease-in-out)

### Don'ts ✗
- Don't mix 4+ distinct colors
- Don't use harsh shadows or blurs
- Don't exceed 400ms for transitions
- Don't use decorative fonts for body
- Don't forget dark mode
- Don't add animations everywhere (use sparingly)
- Don't ignore accessibility

---

## 🔍 Accessibility

### Color Contrast
- **WCAG AA Standard:** 4.5:1 minimum
- **WCAG AAA Standard:** 7:1 (preferred)
- Check with: https://webaim.org/resources/contrastchecker/

### Focus States
- Always visible (ring-2)
- Offset from element (ring-offset-2)
- Color from primary palette
- Keyboard navigable

### Touch Accessibility
- Minimum 48px × 48px targets
- Gap between targets ≥8px
- Large, legible text (min 14px)
- Adequate spacing (8px+ internal)

### Semantic HTML
```html
<button> - All interactive elements
<label> - Form labels connected to inputs
<header> - Top nav
<main> - Main content
<footer> - Bottom nav
<h1-h6> - Proper heading hierarchy
<aria-label> - Icon-only buttons
```

---

## 📦 Component Variants

### Buttons
- Primary (solid teal)
- Secondary (outlined)
- Ghost (no background)
- Destructive (red, warning)

### Cards
- Standard (solid background)
- Glass (frosted)
- Elevated (with shadow)

### Inputs
- Text
- Date
- Time
- Number
- Select (custom)

### States
- Default
- Hover
- Active (pressed)
- Focus
- Disabled
- Loading
- Error

---

## 📊 Responsive Breakpoints

```
Mobile (default)    - Up to 639px
Tablet (md)         - 640px - 1023px
Desktop (lg)        - 1024px+
```

### Responsive Adjustments
- **Padding:** p-4 (mobile) → p-8 (desktop)
- **Font:** text-base (mobile) → text-lg (desktop)
- **Gap:** gap-3 (mobile) → gap-4 (desktop)
- **Grid:** grid-cols-1 (mobile) → grid-cols-2 (desktop)

---

## 🎨 Design Tokens Summary

```css
/* Colors */
--primary: Teal (actions)
--accent: Warm amber (alerts)
--background: Off-white/dark-slate
--foreground: Text color
--card: Card backgrounds
--muted: Secondary states
--border: Dividers

/* Typography */
--font-poppins: Poppins
--font-size-base: 16px
--line-height-relaxed: 1.5

/* Spacing */
--radius: 0.75rem (12px)
Gap scale: 4px increments

/* Effects */
.glass: Frosted glass panels
.soft-shadow: Subtle shadows
.smooth-transition: 300ms ease
```

---

For implementation details, see `COMPONENTS.md` and component source files.
