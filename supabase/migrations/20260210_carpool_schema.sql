-- Carpool app core schema for Supabase / Postgres
-- Generated on 2026-02-10

-- Extensions
create extension if not exists "pgcrypto";

-- 1) Users (NextAuth-compatible)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  phone text unique,
  image text,
  role text not null default 'passenger' check (role in ('passenger', 'driver', 'admin')),
  provider text default 'credentials',
  password_hash text,
  email_verified timestamptz,
  phone_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- 2) Driver verification
create table if not exists public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  national_id text,
  driving_license text,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id)
);

-- 3) Vehicles
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.users(id) on delete cascade,
  make text,
  model text,
  color text,
  plate_number text,
  seats integer not null check (seats > 0),
  photo_url text,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists vehicles_driver_idx on public.vehicles(driver_id);
create index if not exists vehicles_driver_plate_idx on public.vehicles(driver_id, plate_number);

-- 4) Rides (marketplace object)
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id),
  origin text not null,
  destination text not null,
  departure_time timestamptz not null,
  price_per_seat numeric(10,2) not null check (price_per_seat >= 0),
  total_seats integer not null check (total_seats > 0),
  available_seats integer not null check (available_seats >= 0) check (available_seats <= total_seats),
  allows_pets boolean not null default false,
  allows_packages boolean not null default false,
  notes text,
  status text not null default 'open' check (status in ('open', 'full', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists rides_driver_idx on public.rides(driver_id);
create index if not exists rides_departure_idx on public.rides(departure_time);
create index if not exists rides_status_idx on public.rides(status);

-- 5) Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.users(id),
  seats_booked integer not null default 1 check (seats_booked > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'confirmed', 'completed', 'cancelled', 'disputed')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (ride_id, passenger_id)
);
create index if not exists bookings_passenger_idx on public.bookings(passenger_id);
create index if not exists bookings_ride_idx on public.bookings(ride_id);

-- 6) Payments (escrow-ready)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  platform_fee numeric(10,2) not null default 0 check (platform_fee >= 0),
  driver_payout numeric(10,2) not null default 0 check (driver_payout >= 0),
  mpesa_reference text,
  status text not null default 'initiated' check (status in ('initiated', 'held', 'released', 'refunded', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (booking_id)
);
create index if not exists payments_booking_idx on public.payments(booking_id);

-- 7) Trip completion (double confirmation)
create table if not exists public.trip_confirmations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  driver_confirmed boolean not null default false,
  passenger_confirmed boolean not null default false,
  confirmed_at timestamptz,
  unique (booking_id)
);

-- 8) Ratings & reviews
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.users(id),
  reviewee_id uuid not null references public.users(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (booking_id, reviewer_id)
);
create index if not exists ratings_reviewee_idx on public.ratings(reviewee_id);

-- 9) In-app messages (ride scoped)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists messages_ride_idx on public.messages(ride_id);
create index if not exists messages_sender_idx on public.messages(sender_id);

-- Helper functions for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  );
$$;

create or replace function public.is_ride_driver(target_ride uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.rides r
    where r.id = target_ride
      and r.driver_id = auth.uid()
  );
$$;

create or replace function public.is_ride_passenger(target_ride uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.bookings b
    where b.ride_id = target_ride
      and b.passenger_id = auth.uid()
  );
$$;

create or replace function public.is_ride_participant(target_ride uuid)
returns boolean
language sql
stable
as $$
  select coalesce(public.is_ride_driver(target_ride), false)
      or coalesce(public.is_ride_passenger(target_ride), false);
$$;

create or replace function public.can_message_in_ride(target_ride uuid)
returns boolean
language sql
stable
as $$
  select case
    when auth.uid() is null then false
    when public.is_ride_driver(target_ride) then exists(
      select 1 from public.bookings b
      where b.ride_id = target_ride
        and b.status in ('paid', 'confirmed', 'completed')
    )
    else exists(
      select 1 from public.bookings b
      where b.ride_id = target_ride
        and b.passenger_id = auth.uid()
        and b.status in ('paid', 'confirmed', 'completed')
    )
  end;
$$;

-- Enable Row Level Security on sensitive tables
alter table public.driver_profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;

-- Driver profiles RLS
create policy if not exists driver_profiles_select_own on public.driver_profiles
  for select using (auth.uid() = user_id or public.is_admin());
create policy if not exists driver_profiles_insert_own on public.driver_profiles
  for insert with check (auth.uid() = user_id or public.is_admin());
create policy if not exists driver_profiles_update_own on public.driver_profiles
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Bookings RLS
create policy if not exists bookings_select_self_or_driver on public.bookings
  for select using (
    auth.uid() = passenger_id
    or public.is_ride_driver(ride_id)
    or public.is_admin()
  );
create policy if not exists bookings_insert_by_passenger on public.bookings
  for insert with check (auth.uid() = passenger_id or public.is_admin());
create policy if not exists bookings_update_self_or_driver on public.bookings
  for update using (
    auth.uid() = passenger_id
    or public.is_ride_driver(ride_id)
    or public.is_admin()
  )
  with check (
    auth.uid() = passenger_id
    or public.is_ride_driver(ride_id)
    or public.is_admin()
  );
create policy if not exists bookings_delete_self on public.bookings
  for delete using (auth.uid() = passenger_id or public.is_admin());

-- Payments RLS
create policy if not exists payments_select_participants on public.payments
  for select using (
    exists(
      select 1 from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = payments.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    ) or public.is_admin()
  );
create policy if not exists payments_insert_by_driver_or_admin on public.payments
  for insert with check (
    exists(
      select 1 from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = payments.booking_id
        and r.driver_id = auth.uid()
    ) or public.is_admin()
  );
create policy if not exists payments_update_participants on public.payments
  for update using (
    exists(
      select 1 from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = payments.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    ) or public.is_admin()
  )
  with check (
    exists(
      select 1 from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = payments.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    ) or public.is_admin()
  );

-- Messages RLS (ride participants only)
create policy if not exists messages_select_participants on public.messages
  for select using ((public.is_ride_participant(ride_id) and public.can_message_in_ride(ride_id)) or public.is_admin());
create policy if not exists messages_insert_participants on public.messages
  for insert with check (((public.is_ride_participant(ride_id) and public.can_message_in_ride(ride_id)) and auth.uid() = sender_id) or public.is_admin());

-- Indexes to keep RLS helper functions fast
create index if not exists bookings_ride_passenger_idx on public.bookings(ride_id, passenger_id);
create index if not exists rides_driver_id_idx on public.rides(id, driver_id);

