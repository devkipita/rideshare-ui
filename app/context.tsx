'use client'

import React from "react"

import { createContext, useContext, useState } from 'react'

type UserMode = 'splash' | 'passenger' | 'driver'

interface AppContextType {
  mode: UserMode
  setMode: (mode: UserMode) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<UserMode>('splash')

  return (
    <AppContext.Provider value={{ mode, setMode }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppMode() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppMode must be used within AppProvider')
  }
  return context
}
