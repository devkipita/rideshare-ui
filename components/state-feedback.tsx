'use client'

import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'

type StateType = 'loading' | 'success' | 'error' | 'info'

interface StateFeedbackProps {
  state: StateType
  title: string
  message: string
}

const configs = {
  loading: { icon: Loader2, bg: 'bg-blue-500/20', color: 'text-blue-600', spin: 'animate-spin' },
  success: { icon: CheckCircle, bg: 'bg-green-500/20', color: 'text-green-600', spin: '' },
  error: { icon: AlertCircle, bg: 'bg-red-500/20', color: 'text-red-600', spin: '' },
  info: { icon: Info, bg: 'bg-blue-500/20', color: 'text-blue-600', spin: '' },
}

export function StateFeedback({ state, title, message }: StateFeedbackProps) {
  const c = configs[state]
  const Icon = c.icon

  return (
    <div className="glass-card rounded-3xl p-6 flex items-start gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${c.bg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${c.color} ${c.spin}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
