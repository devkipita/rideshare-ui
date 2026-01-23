'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock, Users, Check } from 'lucide-react'
import { DriverProfileDrawer } from './driver-profile-drawer'
import { DriverProfileModal } from './driver-profile-modal' // Import DriverProfileModal

interface RideCardProps {
  driverName: string
  rating: number
  from: string
  to: string
  startTime: string
  endTime: string
  price: number
  seatsLeft: number
  onJoin?: () => void
  onMessage?: () => void
}

export function RideCard({
  driverName,
  rating,
  from,
  to,
  startTime,
  endTime,
  price,
  seatsLeft,
  onJoin,
  onMessage,
}: RideCardProps) {
  const [joined, setJoined] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleJoin = () => {
    setJoined(!joined)
    onJoin?.()
  }

  const mockDriver = {
    id: '1',
    name: driverName,
    rating,
    trips: 142,
    responseTime: '< 2 min',
    carType: 'Toyota Camry',
    carColor: 'Silver',
    platNumber: 'KCP 456A',
    joinDate: 'Jan 2022',
    bio: 'Safe, friendly driver. Regular route between Nanyuki and Nairobi.',
    reviews: [
      {
        author: 'Alice M.',
        rating: 5,
        text: 'Excellent driver, very punctual and friendly!',
      },
      {
        author: 'James K.',
        rating: 4,
        text: 'Good experience, comfortable ride.',
      },
    ],
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden hover:shadow-xl smooth-transition animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Driver Info - Clickable */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">{driverName.charAt(0)}</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{driverName}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Route Info */}
      <div className="mb-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Route</p>
            <p className="font-semibold text-foreground">{from} → {to}</p>
          </div>
        </div>
      </div>

      {/* Time Info */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="text-2xl font-bold text-foreground">
              {startTime} – {endTime}
            </p>
          </div>
        </div>
      </div>

      {/* Price & Seats */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
        <div className="bg-primary/10 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Price per seat</p>
          <p className="text-2xl font-bold text-primary">
            KES <span className="text-xl">{price}</span>
          </p>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Seats Left
          </p>
          <p className="text-2xl font-bold text-foreground">{seatsLeft}</p>
        </div>
      </div>

      {/* Join Button */}
      <Button
        onClick={handleJoin}
        className={`w-full h-12 rounded-2xl font-semibold smooth-transition active:scale-95 ${
          joined
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        {joined ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Joined!
          </>
        ) : (
          'Join Ride'
        )}
      </Button>

      {/* Driver Profile Drawer */}
      <DriverProfileDrawer
        driver={mockDriver}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onMessage={() => {
          setShowProfile(false)
          onMessage?.()
        }}
      />
    </div>
  )
}
