'use client'

import { useState, useEffect } from 'react'
import { AppProvider, useAppMode } from '@/app/context'
import { TopNav } from '@/components/top-nav'
import { BottomNav } from '@/components/bottom-nav'
import { PassengerSearch } from '@/components/passenger-search'
import { RideCard } from '@/components/ride-card'
import { DriverOfferRide } from '@/components/driver-offer-ride'
import { DriverRequests } from '@/components/driver-requests'
import { DriverEarnings } from '@/components/driver-earnings'
import { MessagesScreen } from '@/components/messages-screen'
import { ProfileScreen } from '@/components/profile-screen'
import { MyRides } from '@/components/my-rides'
import { SplashScreen } from '@/components/KipitaSplash'

// Mock ride data
const mockRides = [
  {
    driverName: 'James K.',
    rating: 4.8,
    from: 'Nanyuki',
    to: 'Nairobi',
    startTime: '7:00 AM',
    endTime: '8:00 AM',
    price: 1200,
    seatsLeft: 2,
  },
  {
    driverName: 'Sarah M.',
    rating: 4.9,
    from: 'Nanyuki',
    to: 'Nairobi',
    startTime: '6:30 AM',
    endTime: '7:45 AM',
    price: 1100,
    seatsLeft: 1,
  },
  {
    driverName: 'Mike T.',
    rating: 4.6,
    from: 'Nanyuki',
    to: 'Nairobi',
    startTime: '8:00 AM',
    endTime: '9:15 AM',
    price: 1300,
    seatsLeft: 3,
  },
]

function AppContent() {
  const { mode } = useAppMode()
  const [activeTab, setActiveTab] = useState('search')
  const [searchResults, setSearchResults] = useState(false)

  useEffect(() => {
    setActiveTab(mode === 'passenger' ? 'search' : 'rides')
    setSearchResults(false)
  }, [mode])

  if (mode === 'splash') return <SplashScreen />

  const isPassenger = mode === 'passenger'

  const pageTitle = isPassenger
    ? activeTab === 'search'
      ? 'Find a Group Ride'
      : activeTab === 'trips'
      ? 'My Trips'
      : activeTab === 'messages'
      ? 'Messages'
      : 'Profile'
    : activeTab === 'rides'
    ? 'My Rides'
    : activeTab === 'requests'
    ? 'Ride Requests'
    : activeTab === 'earnings'
    ? 'Earnings'
    : 'Profile'

  const isMessages = activeTab === 'messages'

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
     {isMessages ? (
  <TopNav
    variant="chat"
    user={{ name: 'John D.', role: 'driver' }}
  />
) : (
  <TopNav
    variant="default"
    title={pageTitle}
  />
)}


      {!isMessages && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-sm mx-auto w-full px-4 py-6 pb-24 space-y-4">
            {isPassenger && (
              <>
                {activeTab === 'search' && (
                  <>
                    <PassengerSearch
                      onSearch={() => setSearchResults(true)}
                    />
                    {searchResults && (
                      <div className="mt-8 space-y-4">
                        <h2 className="text-lg font-semibold px-2">
                          {mockRides.length} Rides Available
                        </h2>
                        {mockRides.map((ride, idx) => (
                          <RideCard key={idx} {...ride} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'trips' && <MyRides />}
                {activeTab === 'profile' && <ProfileScreen userMode="passenger" />}
              </>
            )}

            {!isPassenger && (
              <>
                {activeTab === 'rides' && <DriverOfferRide />}
                {activeTab === 'requests' && <DriverRequests />}
                {activeTab === 'earnings' && <DriverEarnings />}
                {activeTab === 'profile' && <ProfileScreen userMode="driver" />}
              </>
            )}
          </div>
        </div>
      )}

      {isMessages && <MessagesScreen />}

      <BottomNav
        mode={isPassenger ? 'passenger' : 'driver'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}


export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
