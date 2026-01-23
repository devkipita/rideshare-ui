'use client'

import { useAppMode } from '@/app/context'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Moon, Sun, User } from 'lucide-react'
import { useEffect, useState } from 'react'

type TopNavProps =
  | { variant: 'default'; title: string }
  | { variant: 'chat'; user: { name: string; role: string } }

export function TopNav(props: TopNavProps) {
  const { setMode } = useAppMode()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    setIsDark(html.classList.contains('dark'))
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light')
  }

  return (
    <div className="sticky top-0 z-40 glass border-b">
      <div className="max-w-screen-sm mx-auto px-4 py-3 h-14 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMode('splash')}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {props.variant === 'default' && (
          <h1 className="text-base font-semibold flex-1 text-center truncate">
            {props.title}
          </h1>
        )}

        {props.variant === 'chat' && (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{props.user.name}</p>
              <p className="text-xs text-muted-foreground">{props.user.role}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  )
}
