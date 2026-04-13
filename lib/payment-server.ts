import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPaymentReceipt, sendTripConfirmation } from "@/lib/email";

type PaymentMethodLabel = "M-Pesa" | "Card";

type ConfirmRidePaymentArgs = {
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  amount: number;
  method: PaymentMethodLabel;
  reference: string;
  seats?: number;
};

type RideWithDriver = {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  status: string;
  price_per_seat: number;
  driver?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

function money(value: number) {
  return Math.round(value * 100) / 100;
}

export async function confirmRidePayment({
  rideId,
  passengerId,
  passengerName,
  passengerEmail,
  amount,
  method,
  reference,
  seats = 1,
}: ConfirmRidePaymentArgs) {
  const seatsBooked = Math.max(1, Math.floor(Number(seats) || 1));

  const { data: ride, error: rideError } = await supabaseAdmin
    .from("rides")
    .select("*, driver:users!driver_id(id,name,email)")
    .eq("id", rideId)
    .single<RideWithDriver>();

  if (rideError || !ride) {
    throw new Error("Ride not found");
  }

  if (!["open", "full"].includes(ride.status)) {
    throw new Error("This ride is no longer available");
  }

  const { data: existingBooking, error: existingError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("ride_id", rideId)
    .eq("passenger_id", passengerId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const alreadyConfirmed =
    existingBooking?.status === "paid" || existingBooking?.status === "confirmed";

  if (!alreadyConfirmed && ride.available_seats < seatsBooked) {
    throw new Error("Not enough seats left on this ride");
  }

  let booking = existingBooking;

  if (booking) {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        seats_booked: seatsBooked,
        status: "confirmed",
      })
      .eq("id", booking.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    booking = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        ride_id: rideId,
        passenger_id: passengerId,
        seats_booked: seatsBooked,
        status: "confirmed",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    booking = data;
  }

  if (!alreadyConfirmed) {
    const nextSeats = Math.max(0, Number(ride.available_seats) - seatsBooked);
    const { error: seatsError } = await supabaseAdmin
      .from("rides")
      .update({
        available_seats: nextSeats,
        status: nextSeats === 0 ? "full" : "open",
      })
      .eq("id", rideId);

    if (seatsError) throw new Error(seatsError.message);
  }

  const platformFee = money(amount * 0.1);
  const driverPayout = money(amount - platformFee);

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from("payments")
    .upsert(
      {
        booking_id: booking.id,
        amount,
        platform_fee: platformFee,
        driver_payout: driverPayout,
        mpesa_reference: reference,
        status: "held",
      },
      { onConflict: "booking_id" },
    )
    .select("*")
    .single();

  if (paymentError) throw new Error(paymentError.message);

  await Promise.allSettled([
    sendPaymentReceipt({
      to: passengerEmail,
      name: passengerName,
      amount,
      method,
      rideId,
      reference,
    }),
    sendTripConfirmation({
      to: passengerEmail,
      name: passengerName,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departure_time,
      driverName: ride.driver?.name ?? "Your driver",
      seats: seatsBooked,
    }),
  ]);

  return {
    booking,
    payment,
    trip: {
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departure_time,
      driverName: ride.driver?.name ?? "Your driver",
      seats: seatsBooked,
    },
  };
}
