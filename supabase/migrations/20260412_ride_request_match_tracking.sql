-- Track which driver matched a ride request and when

alter table public.ride_requests
  add column if not exists matched_driver_id uuid references public.users(id) on delete set null,
  add column if not exists matched_at timestamptz;

create index if not exists ride_requests_matched_driver_idx
  on public.ride_requests(matched_driver_id);
