-- Run this in your Supabase SQL editor (https://supabase.com/dashboard)

create table if not exists public.subscribers (
  id               uuid         primary key default gen_random_uuid(),
  email            text         unique not null,
  unsubscribe_token text        unique not null default encode(gen_random_bytes(32), 'hex'),
  status           text         not null default 'active'
                                check (status in ('active', 'unsubscribed')),
  subscribed_at    timestamptz  not null default now(),
  unsubscribed_at  timestamptz
);

-- Only service role can read/write subscribers (no public access)
alter table public.subscribers enable row level security;

-- Index for fast token lookups (unsubscribe link)
create index if not exists subscribers_token_idx on public.subscribers (unsubscribe_token);
