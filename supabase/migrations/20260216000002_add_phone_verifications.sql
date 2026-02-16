-- Phone verification table migration
-- Generated on 2026-02-16
-- This migration adds phone verification functionality

-- Create phone_verifications table
create table if not exists public.phone_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  verified_at timestamptz
);

-- Create indexes for better query performance
create index if not exists phone_verifications_user_idx on public.phone_verifications(user_id);
create index if not exists phone_verifications_phone_idx on public.phone_verifications(phone);

-- Enable Row Level Security
alter table public.phone_verifications enable row level security;

-- RLS Policies for phone_verifications
drop policy if exists phone_verifications_select_own on public.phone_verifications;
create policy phone_verifications_select_own on public.phone_verifications
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists phone_verifications_insert_own on public.phone_verifications;
create policy phone_verifications_insert_own on public.phone_verifications
  for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists phone_verifications_update_own on public.phone_verifications;
create policy phone_verifications_update_own on public.phone_verifications
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists phone_verifications_delete_own on public.phone_verifications;
create policy phone_verifications_delete_own on public.phone_verifications
  for delete using (auth.uid() = user_id or public.is_admin());

-- Optional: Function to clean up expired verification codes
create or replace function public.cleanup_expired_verifications()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.phone_verifications
  where expires_at < now()
    and verified_at is null;
end;
$$;

-- Comment explaining the table
comment on table public.phone_verifications is 'Stores phone verification codes with expiry';