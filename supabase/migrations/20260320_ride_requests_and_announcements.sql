-- Ride requests (passengers post when no rides found)
create table if not exists public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  preferred_date date not null,
  seats_needed integer not null default 1 check (seats_needed > 0),
  allows_pets boolean not null default false,
  allows_packages boolean not null default false,
  pickup_station text,
  dropoff_station text,
  note text,
  status text not null default 'active' check (status in ('active', 'matched', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists ride_requests_passenger_idx on public.ride_requests(passenger_id);
create index if not exists ride_requests_status_idx on public.ride_requests(status);
create index if not exists ride_requests_date_idx on public.ride_requests(preferred_date);

-- Road announcements (anyone can post)
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  location text,
  route_from text,
  route_to text,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists announcements_created_idx on public.announcements(created_at desc);
create index if not exists announcements_user_idx on public.announcements(user_id);
