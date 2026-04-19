-- Store the payable ride created when a driver accepts a passenger request.

alter table public.ride_requests
  add column if not exists matched_ride_id uuid references public.rides(id) on delete set null,
  add column if not exists match_price_per_seat numeric(10,2),
  add column if not exists match_departure_time timestamptz;

create index if not exists ride_requests_matched_ride_idx
  on public.ride_requests(matched_ride_id);
