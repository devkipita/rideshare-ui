'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Calendar, Clock, Users, DollarSign, Dog, Luggage, Plane } from 'lucide-react'

interface OfferRideForm {
  from: string
  to: string
  date: string
  departTime: string
  arrivalTime: string
  seats: number
  pricePerSeat: number
  pets: boolean
  luggage: boolean
  airport: boolean
}

interface DriverOfferRideProps {
  onSubmit?: (form: OfferRideForm) => void
}

export function DriverOfferRide({ onSubmit }: DriverOfferRideProps) {
  const [form, setForm] = useState<OfferRideForm>({
    from: '',
    to: '',
    date: '',
    departTime: '',
    arrivalTime: '',
    seats: 4,
    pricePerSeat: 1200,
    pets: false,
    luggage: false,
    airport: false,
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    setIsSubmitted(true)
    onSubmit?.(form)
    // Reset form after 2 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setForm({
        from: '',
        to: '',
        date: '',
        departTime: '',
        arrivalTime: '',
        seats: 4,
        pricePerSeat: 1200,
        pets: false,
        luggage: false,
        airport: false,
      })
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Ride Posted!</h3>
        <p className="text-muted-foreground text-center max-w-xs">
          Your ride is now live. Passengers will start requesting to join soon.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* From Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          From
        </label>
        <Input
          placeholder="Nanyuki"
          value={form.from}
          onChange={(e) => setForm({ ...form, from: e.target.value })}
          className="glass-card py-3 text-base focus-ring"
        />
      </div>

      {/* To Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          To
        </label>
        <Input
          placeholder="Nairobi"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
          className="glass-card py-3 text-base focus-ring"
        />
      </div>

      {/* Date Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Date
        </label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="glass-card py-3 text-base focus-ring"
        />
      </div>

      {/* Time Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Depart
          </label>
          <Input
            type="time"
            value={form.departTime}
            onChange={(e) => setForm({ ...form, departTime: e.target.value })}
            className="glass-card py-3 text-base focus-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Arrive
          </label>
          <Input
            type="time"
            value={form.arrivalTime}
            onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
            className="glass-card py-3 text-base focus-ring"
          />
        </div>
      </div>

      {/* Seats Available */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Available Seats
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => setForm({ ...form, seats: num })}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                form.seats === num
                  ? 'glass bg-primary text-primary-foreground'
                  : 'glass text-foreground hover:bg-muted'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Price per Seat */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Price per Seat
        </label>
        <div className="glass-card flex items-center gap-3 px-4 py-3 rounded-xl">
          <span className="text-muted-foreground font-medium">KES</span>
          <Input
            type="number"
            placeholder="1200"
            value={form.pricePerSeat}
            onChange={(e) => setForm({ ...form, pricePerSeat: Number(e.target.value) })}
            className="flex-1 border-0 bg-transparent text-base font-semibold p-0 focus-ring"
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Amenities</p>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setForm({ ...form, pets: !form.pets })}
            className={`glass-card py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${
              form.pets ? 'bg-primary/20 border-primary' : ''
            }`}
          >
            <Dog className={`w-5 h-5 ${form.pets ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium">Pets OK</span>
          </button>
          <button
            onClick={() => setForm({ ...form, luggage: !form.luggage })}
            className={`glass-card py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${
              form.luggage ? 'bg-primary/20 border-primary' : ''
            }`}
          >
            <Luggage
              className={`w-5 h-5 ${form.luggage ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span className="text-xs font-medium">Luggage</span>
          </button>
          <button
            onClick={() => setForm({ ...form, airport: !form.airport })}
            className={`glass-card py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${
              form.airport ? 'bg-primary/20 border-primary' : ''
            }`}
          >
            <Plane
              className={`w-5 h-5 ${form.airport ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <span className="text-xs font-medium">Airport</span>
          </button>
        </div>
      </div>

      {/* Post Button */}
      <Button
        onClick={handleSubmit}
        className="w-full h-14 rounded-2xl text-base font-semibold soft-shadow smooth-transition hover:scale-105 active:scale-95 mt-6"
      >
        Post Ride
      </Button>
    </div>
  )
}
