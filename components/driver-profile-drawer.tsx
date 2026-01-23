'use client'

import React from "react"
import { useState } from 'react'
import { X, Star, MapPin, Car, Shield, MessageCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DriverProfile {
  id: string
  name: string
  rating: number
  trips: number
  responseTime: string
  carType: string
  carColor: string
  platNumber: string
  joinDate: string
  bio: string
  reviews: Array<{
    author: string
    rating: number
    text: string
  }>
}

interface DriverProfileDrawerProps {
  driver: DriverProfile
  isOpen: boolean
  onClose: () => void
  onMessage?: () => void
}

export function DriverProfileDrawer({ driver, isOpen, onClose, onMessage }: DriverProfileDrawerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)

  const handleDragStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientY)
  }

  const handleDragEnd = (e: React.TouchEvent) => {
    if (!isDragging) return
    const dragEnd = e.changedTouches[0].clientY
    if (dragEnd - dragStart > 50) {
      onClose()
    }
    setIsDragging(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Bottom Drawer */}
      <div
        className="relative bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl glass-card max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 pb-24 sm:pb-6"
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Drag Handle */}
        <div className="sticky top-0 flex justify-center pt-3 pb-2 bg-gradient-to-b from-background to-transparent">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Driver Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{driver.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground">{driver.name}</h2>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{driver.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({driver.trips} trips)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Member since {driver.joinDate}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm text-foreground leading-relaxed">{driver.bio}</p>
        </div>

        {/* Car Details */}
        <div className="px-6 py-4 space-y-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Vehicle Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Car Type</p>
                <p className="text-sm font-medium text-foreground">{driver.carType}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Plate No.</p>
                <p className="text-sm font-medium text-foreground">{driver.platNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 space-y-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Quick Stats</h3>
          <div className="flex gap-4">
            <div className="flex-1 glass rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Response Time</p>
              <p className="text-sm font-semibold text-foreground">{driver.responseTime}</p>
            </div>
            <div className="flex-1 glass rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Car Color</p>
              <p className="text-sm font-semibold text-foreground">{driver.carColor}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {driver.reviews.map((review, idx) => (
              <div key={idx} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm text-foreground">{review.author}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 glass border-t px-6 py-4 max-w-md mx-auto w-full flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full bg-transparent"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1 rounded-full"
            onClick={() => {
              onMessage?.()
              onClose()
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Driver
          </Button>
        </div>
      </div>
    </div>
  )
}
