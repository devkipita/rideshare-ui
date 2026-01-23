/**
 * RideShare MVP Configuration
 * Centralized settings for easy customization
 */

export const APP_CONFIG = {
  // App Identity
  name: 'RideShare',
  tagline: 'Share the road. Split the cost.',
  description: 'Join a community of conscious travelers heading the same way.',

  // Branding
  brand: {
    name: 'RideShare',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
  },

  // Features
  features: {
    darkMode: true,
    notifications: false,
    realTimeTracking: false,
    paymentIntegration: false,
    socialSharing: false,
    reviews: true,
    messaging: true,
    verification: false,
  },

  // Limits
  limits: {
    minSeats: 1,
    maxSeats: 4,
    minPrice: 500,
    maxPrice: 10000,
    messageCharLimit: 280,
    maxUpcomingRides: 10,
  },

  // Pricing
  pricing: {
    currency: 'KES',
    currencySymbol: 'KES',
    platformFee: 0.1, // 10%
    defaultPricePerKm: 50,
  },

  // Navigation
  navigation: {
    passengerTabs: ['search', 'trips', 'messages', 'profile'],
    driverTabs: ['rides', 'requests', 'earnings', 'profile'],
  },

  // UI Preferences
  ui: {
    // Animation speeds (ms)
    animationSpeed: 300,
    transitionEasing: 'ease-out',
    
    // Border radius
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      full: '9999px',
    },

    // Shadows
    shadows: {
      soft: '0 1px 2px rgba(0,0,0,0.05)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
    },

    // Spacing
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      xxl: '32px',
    },
  },

  // Localization
  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'sw'], // English, Swahili
    timezone: 'Africa/Nairobi',
  },

  // Locations (default values)
  locations: {
    defaultOrigin: 'Nairobi',
    defaultDestination: 'Nanyuki',
    country: 'Kenya',
    coordinates: {
      center: [-1.2921, 36.8219], // Nairobi center
      maxZoom: 18,
      minZoom: 10,
    },
  },

  // Ride settings
  rides: {
    // Estimated durations for common routes
    estimatedDurations: {
      'Nanyuki-Nairobi': 60,
      'Nairobi-Nanyuki': 60,
      'Nairobi-Mombasa': 480,
      'Nairobi-Kisumu': 300,
    },

    // Ride status values
    status: {
      POSTED: 'posted',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },

    // Auto-refresh intervals (ms)
    refreshIntervals: {
      searchResults: 30000, // 30 seconds
      messages: 5000, // 5 seconds
      rideStatus: 10000, // 10 seconds
    },
  },

  // User settings
  user: {
    minRating: 3.5,
    verificationRequired: false,
    licenseRequired: false, // For drivers
    backgroundCheckRequired: false,
  },

  // API Configuration (when backend is added)
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Analytics & Tracking
  analytics: {
    enabled: false,
    trackingId: process.env.NEXT_PUBLIC_GA_ID,
  },

  // Error Messages
  messages: {
    errors: {
      networkError: 'Network error. Please check your connection.',
      validationError: 'Please check your input and try again.',
      authError: 'Authentication failed. Please log in again.',
      notFound: 'Item not found.',
      serverError: 'Server error. Please try again later.',
    },
    success: {
      ridePosted: 'Your ride has been posted successfully!',
      rideJoined: 'You have successfully joined the ride!',
      messageSent: 'Message sent!',
      profileUpdated: 'Profile updated successfully!',
    },
    warnings: {
      unsavedChanges: 'You have unsaved changes.',
      confirmDelete: 'Are you sure? This action cannot be undone.',
    },
  },

  // Feature flags for easy toggling
  featureFlags: {
    enableLiveTracking: false,
    enablePayments: false,
    enableSocialLogin: false,
    enablePhoneVerification: false,
    enableEmailVerification: false,
    enableCarpoolingTips: true,
    enableReferralProgram: false,
    enableInsurance: false,
  },

  // Development settings
  development: {
    mockData: true, // Use mock data in development
    debugMode: false,
    verboseLogging: false,
    simulateSlowNetwork: false,
  },
}

/**
 * Helper function to get feature status
 */
export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.featureFlags): boolean => {
  return APP_CONFIG.featureFlags[feature]
}

/**
 * Helper function to format price
 */
export const formatPrice = (price: number): string => {
  return `${APP_CONFIG.pricing.currency} ${price.toLocaleString()}`
}

/**
 * Helper function to get default ride duration
 */
export const getEstimatedDuration = (route: string): number | undefined => {
  return APP_CONFIG.rides.estimatedDurations[route as keyof typeof APP_CONFIG.rides.estimatedDurations]
}

/**
 * Helper function to check rate limit
 */
export const isUserRatedHighEnough = (rating: number): boolean => {
  return rating >= APP_CONFIG.user.minRating
}

/**
 * Get error message
 */
export const getErrorMessage = (errorType: keyof typeof APP_CONFIG.messages.errors): string => {
  return APP_CONFIG.messages.errors[errorType]
}

/**
 * Get success message
 */
export const getSuccessMessage = (successType: keyof typeof APP_CONFIG.messages.success): string => {
  return APP_CONFIG.messages.success[successType]
}

export default APP_CONFIG
