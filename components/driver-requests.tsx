'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, CheckCircle, XCircle, User } from 'lucide-react'

interface Request {
  id: string
  passengerName: string
  rating: number
  seatsNeeded: number
  status: 'pending' | 'accepted' | 'rejected'
}

const mockRequests: Request[] = [
  { id: '1', passengerName: 'Alice K.', rating: 4.9, seatsNeeded: 1, status: 'pending' },
  { id: '2', passengerName: 'Bob J.', rating: 4.7, seatsNeeded: 2, status: 'pending' },
  { id: '3', passengerName: 'Carol M.', rating: 5, seatsNeeded: 1, status: 'accepted' },
]

export function DriverRequests() {
  const [requests, setRequests] = useState(mockRequests)

  const handleAccept = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r)))
  }

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)))
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const acceptedRequests = requests.filter((r) => r.status === 'accepted')

  return (
    <div className="space-y-6">
      {/* Pending Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="glass-card rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{req.passengerName}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span>{req.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/20 rounded-lg px-3 py-1">
                    <span className="text-sm font-semibold text-primary">{req.seatsNeeded} seat</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAccept(req.id)}
                    className="flex-1 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold smooth-transition"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(req.id)}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-semibold smooth-transition"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Section */}
      {acceptedRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
            Accepted ({acceptedRequests.length})
          </h3>
          <div className="space-y-3">
            {acceptedRequests.map((req) => (
              <div key={req.id} className="glass-card rounded-2xl border-green-500/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{req.passengerName}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Confirmed</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-500/20 rounded-lg px-3 py-1">
                    <span className="text-sm font-semibold text-green-600">{req.seatsNeeded} seat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingRequests.length === 0 && acceptedRequests.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Yet</h3>
          <p className="text-muted-foreground">Passengers will request to join your ride soon</p>
        </div>
      )}
    </div>
  )
}
