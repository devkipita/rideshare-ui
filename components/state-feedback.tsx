'use client'

import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'

type StateType = 'loading' | 'success' | 'error' | 'info'

interface StateFeedbackProps {
  state: StateType
  title: string
  message: string
}

export function StateFeedback({ state, title, message }: StateFeedbackProps) {
  const configs = {
    loading: {
      icon: Loader2,
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-600',
      animation: 'animate-spin',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-600',
      animation: '',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/20',
      iconColor: 'text-red-600',
      animation: '',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-600',
      animation: '',
    },
  }

  const config = configs[state]
  const Icon = config.icon

  return (
    <div className="glass-card rounded-3xl p-6 flex items-start gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${config.iconColor} ${config.animation}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
