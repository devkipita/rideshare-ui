'use client'

import { useState } from 'react'
import { X, Star, MapPin, Car, Shield, MessageCircle } from 'lucide-react'
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

interface DriverProfileModalProps {
  driver: DriverProfile
  isOpen: boolean
  onClose: () => void
  onMessage?: () => void
}

export function DriverProfileModal({ driver, isOpen, onClose, onMessage }: DriverProfileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-3xl sm:rounded-2xl w-full sm:max-w-md sm:mx-auto glass-card max-h-[90vh] sm:max-h-96 overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pr-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{driver.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{driver.name}</h2>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{driver.rating}</span>
              <span className="text-sm text-muted-foreground">({driver.trips} trips)</span>
            </div>
          </div>
        </div>

        {/* Driver Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Response Time</div>
            <div className="font-semibold text-foreground">{driver.responseTime}</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Member Since</div>
            <div className="font-semibold text-foreground">{driver.joinDate}</div>
          </div>
          <div className="col-span-2 bg-muted/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Vehicle</span>
            </div>
            <div className="font-semibold text-foreground">
              {driver.carColor} {driver.carType}
            </div>
            <div className="text-sm text-muted-foreground">{driver.platNumber}</div>
          </div>
        </div>

        {/* Bio */}
        {driver.bio && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{driver.bio}</p>
          </div>
        )}

        {/* Trust Badge */}
        <div className="flex items-center gap-2 mb-6 text-sm text-primary">
          <Shield className="w-4 h-4" />
          <span>Verified and Rated Driver</span>
        </div>

        {/* Reviews */}
        {driver.reviews.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3">Recent Reviews</h3>
            <div className="space-y-3">
              {driver.reviews.slice(0, 2).map((review, idx) => (
                <div key={idx} className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{review.author}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? 'fill-accent text-accent' : 'text-muted'
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
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12 bg-transparent"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1 rounded-xl h-12 gap-2"
            onClick={onMessage}
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>
        </div>
      </div>
    </div>
  )
}
