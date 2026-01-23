'use client'

import { TrendingUp, Calendar, DollarSign, ArrowUpRight } from 'lucide-react'

interface Earnings {
  date: string
  amount: number
  passengers: number
}

const mockEarnings: Earnings[] = [
  { date: 'Today', amount: 4800, passengers: 3 },
  { date: 'Yesterday', amount: 5600, passengers: 4 },
  { date: '3 days ago', amount: 3200, passengers: 2 },
  { date: 'Last week', amount: 28000, passengers: 18 },
]

export function DriverEarnings() {
  const totalEarnings = mockEarnings.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = 124000
  const totalEarnings2 = 342000

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-8 -mt-8" />
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-3xl font-bold text-primary mb-2">
            KES
            <br />
            <span className="text-2xl">{thisMonth.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12% vs last</span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full -mr-8 -mt-8" />
          <p className="text-xs text-muted-foreground mb-1">All Time</p>
          <p className="text-3xl font-bold text-accent mb-2">
            KES
            <br />
            <span className="text-2xl">{totalEarnings2.toLocaleString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">Since joining</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Recent Activity</h3>
        <div className="space-y-2">
          {mockEarnings.map((earning, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 flex items-center justify-between hover:shadow-lg smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{earning.date}</p>
                  <p className="text-sm text-muted-foreground">{earning.passengers} passengers</p>
                </div>
              </div>
              <p className="font-bold text-lg text-primary">
                +{earning.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Info */}
      <div className="glass-card rounded-3xl p-6 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Morning and evening commutes earn 20% more. Post rides during peak hours for
              maximum earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
