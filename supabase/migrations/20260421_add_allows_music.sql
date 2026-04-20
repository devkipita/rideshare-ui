-- Add allows_music column to rides and ride_requests tables
alter table rides add column if not exists allows_music boolean not null default false;
alter table ride_requests add column if not exists allows_music boolean not null default false;
