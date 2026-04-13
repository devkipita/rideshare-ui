alter table public.ride_requests
  add column if not exists preferred_time time;

create index if not exists ride_requests_preferred_time_idx
  on public.ride_requests(preferred_time);
