'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, MapPin, MessageCircle, User, Briefcase, Clock, TrendingUp } from 'lucide-react'

interface BottomNavProps {
  mode: 'passenger' | 'driver'
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNav({ mode, activeTab, onTabChange }: BottomNavProps) {
  const passengerTabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  const driverTabs = [
    { id: 'rides', label: 'My Rides', icon: Briefcase },
    { id: 'requests', label: 'Requests', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  const tabs = mode === 'passenger' ? passengerTabs : driverTabs

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t">
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-around h-16 sm:h-20 px-1 sm:px-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 sm:gap-1 rounded-lg transition-all duration-300 smooth-transition touch-target active:scale-95 ${
                activeTab === id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  activeTab === id ? 'scale-110' : 'scale-100'
                }`}
              />
              <span className="text-xs font-medium hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
