-- ============================================================
-- saved_items  (user wishlist / favourites)
-- ============================================================
create table if not exists saved_items (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);

alter table saved_items enable row level security;

create policy "Users can read own saved items"
  on saved_items for select
  using (auth.uid() = user_id);

create policy "Users can save items"
  on saved_items for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave items"
  on saved_items for delete
  using (auth.uid() = user_id);
