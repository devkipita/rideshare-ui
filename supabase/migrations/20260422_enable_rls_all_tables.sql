-- Security hardening: Enable RLS on all public tables that were missing it
-- Fixes Supabase security advisory: rls_disabled_in_public
-- Date: 2026-04-22

-- ============================================================
-- 1) USERS — Enable RLS
-- ============================================================
alter table public.users enable row level security;

-- Anyone can read basic user info (needed for driver names on rides, etc.)
drop policy if exists users_select_all on public.users;
create policy users_select_all on public.users
  for select using (true);

-- Users can only update their own row
drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Only the app (service role) or admin can insert users (signup goes through API)
drop policy if exists users_insert_admin on public.users;
create policy users_insert_admin on public.users
  for insert with check (public.is_admin());

-- Users cannot delete their own account via direct DB access
drop policy if exists users_delete_admin on public.users;
create policy users_delete_admin on public.users
  for delete using (public.is_admin());


-- ============================================================
-- 2) VEHICLES — Enable RLS
-- ============================================================
alter table public.vehicles enable row level security;

-- Anyone can view vehicles (shown on ride cards)
drop policy if exists vehicles_select_all on public.vehicles;
create policy vehicles_select_all on public.vehicles
  for select using (true);

-- Drivers can only manage their own vehicles
drop policy if exists vehicles_insert_own on public.vehicles;
create policy vehicles_insert_own on public.vehicles
  for insert with check (auth.uid() = driver_id or public.is_admin());

drop policy if exists vehicles_update_own on public.vehicles;
create policy vehicles_update_own on public.vehicles
  for update using (auth.uid() = driver_id or public.is_admin())
  with check (auth.uid() = driver_id or public.is_admin());

drop policy if exists vehicles_delete_own on public.vehicles;
create policy vehicles_delete_own on public.vehicles
  for delete using (auth.uid() = driver_id or public.is_admin());


-- ============================================================
-- 3) RIDES — Enable RLS
-- ============================================================
alter table public.rides enable row level security;

-- Anyone can view open rides (public search)
drop policy if exists rides_select_all on public.rides;
create policy rides_select_all on public.rides
  for select using (true);

-- Only the driver who owns the ride can insert
drop policy if exists rides_insert_driver on public.rides;
create policy rides_insert_driver on public.rides
  for insert with check (auth.uid() = driver_id or public.is_admin());

-- Only the driver who owns the ride can update (e.g. cancel, mark full)
drop policy if exists rides_update_driver on public.rides;
create policy rides_update_driver on public.rides
  for update using (auth.uid() = driver_id or public.is_admin())
  with check (auth.uid() = driver_id or public.is_admin());

-- Only the driver or admin can delete a ride
drop policy if exists rides_delete_driver on public.rides;
create policy rides_delete_driver on public.rides
  for delete using (auth.uid() = driver_id or public.is_admin());


-- ============================================================
-- 4) TRIP_CONFIRMATIONS — Enable RLS
-- ============================================================
alter table public.trip_confirmations enable row level security;

-- Participants of the booking can view confirmations
drop policy if exists trip_confirmations_select on public.trip_confirmations;
create policy trip_confirmations_select on public.trip_confirmations
  for select using (
    exists(
      select 1
      from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = trip_confirmations.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
    or public.is_admin()
  );

-- Participants can insert confirmations
drop policy if exists trip_confirmations_insert on public.trip_confirmations;
create policy trip_confirmations_insert on public.trip_confirmations
  for insert with check (
    exists(
      select 1
      from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = trip_confirmations.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
    or public.is_admin()
  );

-- Participants can update their confirmation flag
drop policy if exists trip_confirmations_update on public.trip_confirmations;
create policy trip_confirmations_update on public.trip_confirmations
  for update using (
    exists(
      select 1
      from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = trip_confirmations.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
    or public.is_admin()
  )
  with check (
    exists(
      select 1
      from public.bookings b
      join public.rides r on r.id = b.ride_id
      where b.id = trip_confirmations.booking_id
        and (b.passenger_id = auth.uid() or r.driver_id = auth.uid())
    )
    or public.is_admin()
  );


-- ============================================================
-- 5) RATINGS — Enable RLS
-- ============================================================
alter table public.ratings enable row level security;

-- Anyone can read ratings (public reviews)
drop policy if exists ratings_select_all on public.ratings;
create policy ratings_select_all on public.ratings
  for select using (true);

-- Only the reviewer can insert their rating
drop policy if exists ratings_insert_reviewer on public.ratings;
create policy ratings_insert_reviewer on public.ratings
  for insert with check (auth.uid() = reviewer_id or public.is_admin());

-- Only the reviewer can update their rating
drop policy if exists ratings_update_reviewer on public.ratings;
create policy ratings_update_reviewer on public.ratings
  for update using (auth.uid() = reviewer_id or public.is_admin())
  with check (auth.uid() = reviewer_id or public.is_admin());

-- Only admin can delete ratings
drop policy if exists ratings_delete_admin on public.ratings;
create policy ratings_delete_admin on public.ratings
  for delete using (public.is_admin());


-- ============================================================
-- 6) RIDE_REQUESTS — Enable RLS
-- ============================================================
alter table public.ride_requests enable row level security;

-- Authenticated users can view active requests (drivers need to see them to match)
drop policy if exists ride_requests_select on public.ride_requests;
create policy ride_requests_select on public.ride_requests
  for select using (auth.uid() is not null);

-- Passengers can insert their own requests
drop policy if exists ride_requests_insert_own on public.ride_requests;
create policy ride_requests_insert_own on public.ride_requests
  for insert with check (auth.uid() = passenger_id or public.is_admin());

-- The passenger who owns the request OR an admin can update it (e.g. match/cancel)
drop policy if exists ride_requests_update on public.ride_requests;
create policy ride_requests_update on public.ride_requests
  for update using (auth.uid() = passenger_id or public.is_admin())
  with check (auth.uid() = passenger_id or public.is_admin());

-- Only the passenger or admin can delete a request
drop policy if exists ride_requests_delete_own on public.ride_requests;
create policy ride_requests_delete_own on public.ride_requests
  for delete using (auth.uid() = passenger_id or public.is_admin());


-- ============================================================
-- 7) ANNOUNCEMENTS — Enable RLS
-- ============================================================
alter table public.announcements enable row level security;

-- Anyone can read announcements (public safety info)
drop policy if exists announcements_select_all on public.announcements;
create policy announcements_select_all on public.announcements
  for select using (true);

-- Authenticated users can post announcements
drop policy if exists announcements_insert_auth on public.announcements;
create policy announcements_insert_auth on public.announcements
  for insert with check (auth.uid() = user_id);

-- Only the poster or admin can update their announcement
drop policy if exists announcements_update_own on public.announcements;
create policy announcements_update_own on public.announcements
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Only the poster or admin can delete their announcement
drop policy if exists announcements_delete_own on public.announcements;
create policy announcements_delete_own on public.announcements
  for delete using (auth.uid() = user_id or public.is_admin());
