-- ============================================================
-- profiles
-- ============================================================
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  first_name  text,
  last_name   text,
  username    text unique,
  role        text not null default 'user'
                check (role in ('user', 'vendor', 'admin')),
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

-- users can read and update their own row (but cannot change their role)
create policy "own profile: insert"
  on profiles for insert
  with check (auth.uid() = id);

create policy "own profile: select"
  on profiles for select
  using (auth.uid() = id);

create policy "own profile: update"
  on profiles for update
  using (auth.uid() = id)
  with check (
    role = (select role from profiles where id = auth.uid())
  );

-- admins can read every profile
create policy "admin: select all"
  on profiles for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, role, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'user'),
    new.raw_user_meta_data ->> 'username'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- products
-- ============================================================
create table if not exists products (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  slug        text unique,
  category    text not null,
  description text,
  price       numeric(12, 2) not null check (price >= 0),
  unit        text not null default 'piece',
  stock       integer not null default 0 check (stock >= 0),
  sold        integer not null default 0,
  image_url   text,
  location    text,
  status      text not null default 'pending'
                check (status in ('draft', 'pending', 'active', 'suspended', 'deleted')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table products enable row level security;

create policy "Anyone can read active products"
  on products for select
  using (status = 'active');

create policy "Vendors can read own products"
  on products for select
  using (auth.uid() = user_id);

create policy "Vendors can insert own products"
  on products for insert
  with check (auth.uid() = user_id);

create policy "Vendors can update own products"
  on products for update
  using (auth.uid() = user_id);

create policy "Admins can do everything on products"
  on products for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- blogs
-- ============================================================
create table if not exists blogs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  category    text not null default 'General',
  excerpt     text,
  content     text,
  image_url   text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'published', 'suspended', 'deleted')),
  views       integer not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table blogs enable row level security;

create policy "Anyone can read approved blogs"
  on blogs for select
  using (status in ('approved', 'published'));

create policy "Users can read own blogs"
  on blogs for select
  using (auth.uid() = user_id);

create policy "Users can insert own blogs"
  on blogs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own blogs"
  on blogs for update
  using (auth.uid() = user_id);

create policy "Admins can do everything on blogs"
  on blogs for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- blog_likes
-- ============================================================
create table if not exists blog_likes (
  id          uuid default gen_random_uuid() primary key,
  blog_id     uuid not null references blogs(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null check (type in ('like', 'dislike')),
  created_at  timestamptz default now(),
  unique(blog_id, user_id)
);

alter table blog_likes enable row level security;

create policy "Anyone can read likes"       on blog_likes for select using (true);
create policy "Auth users can insert likes" on blog_likes for insert with check (auth.uid() = user_id);
create policy "Users can update own likes"  on blog_likes for update using (auth.uid() = user_id);
create policy "Users can delete own likes"  on blog_likes for delete using (auth.uid() = user_id);

-- ============================================================
-- blog_comments
-- ============================================================
create table if not exists blog_comments (
  id          uuid default gen_random_uuid() primary key,
  blog_id     uuid not null references blogs(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table blog_comments enable row level security;

create policy "Anyone can read comments"       on blog_comments for select using (true);
create policy "Auth users can insert comments" on blog_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments"  on blog_comments for delete using (auth.uid() = user_id);
create policy "Admins can delete any comment"  on blog_comments for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- events
-- ============================================================
create table if not exists events (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  theme       text,
  date        date not null,
  venue       text,
  location    text,
  description text,
  image_url   text,
  slots       integer not null default 100,
  rsvps       integer not null default 0,
  status      text not null default 'active'
                check (status in ('draft', 'active', 'cancelled', 'completed')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table events enable row level security;

create policy "Anyone can read active events"
  on events for select using (status = 'active');

create policy "Owners can read own events"
  on events for select using (auth.uid() = user_id);

create policy "Auth users can insert events"
  on events for insert with check (auth.uid() = user_id);

create policy "Owners can update own events"
  on events for update using (auth.uid() = user_id);

create policy "Admins can do everything on events"
  on events for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- event_rsvps
-- ============================================================
create table if not exists event_rsvps (
  id         uuid default gen_random_uuid() primary key,
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

alter table event_rsvps enable row level security;

create policy "Anyone can read rsvps"         on event_rsvps for select using (true);
create policy "Auth users can rsvp"           on event_rsvps for insert with check (auth.uid() = user_id);
create policy "Users can cancel own rsvp"     on event_rsvps for delete using (auth.uid() = user_id);

-- ============================================================
-- projects
-- ============================================================
create table if not exists projects (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  category    text not null,
  summary     text,
  description text,
  image_url   text,
  target      numeric(14, 2) not null check (target > 0),
  raised      numeric(14, 2) not null default 0,
  days_left   integer not null default 30,
  status      text not null default 'pending'
                check (status in ('pending', 'active', 'completed', 'rejected')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table projects enable row level security;

create policy "Anyone can read active projects"
  on projects for select using (status in ('active', 'completed'));

create policy "Owners can read own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Auth users can submit projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Owners can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Admins can do everything on projects"
  on projects for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- donations
-- ============================================================
create table if not exists donations (
  id           uuid default gen_random_uuid() primary key,
  project_id   uuid not null references projects(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  amount       numeric(14, 2) not null check (amount > 0),
  reference    text,
  status       text not null default 'pending'
                 check (status in ('pending', 'completed', 'failed')),
  created_at   timestamptz default now()
);

alter table donations enable row level security;

create policy "Owners can read own donations"   on donations for select using (auth.uid() = user_id);
create policy "Auth users can donate"           on donations for insert with check (auth.uid() = user_id);
create policy "Admins can read all donations"   on donations for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- orders
-- ============================================================
create table if not exists orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid not null references profiles(id) on delete cascade,
  vendor_id        uuid references profiles(id),
  total            numeric(14, 2) not null check (total >= 0),
  customer         text,
  product          text,
  qty              integer not null default 1,
  delivery_address text,
  reference        text,
  status           text not null default 'processing'
                     check (status in ('processing', 'shipped', 'delivered', 'cancelled')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table orders enable row level security;

create policy "Users can read own orders"   on orders for select using (auth.uid() = user_id);
create policy "Vendors can read own orders" on orders for select using (auth.uid() = vendor_id);
create policy "Auth users can place orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage all orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- order_items
-- ============================================================
create table if not exists order_items (
  id          uuid default gen_random_uuid() primary key,
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid references products(id),
  name        text not null,
  price       numeric(14, 2) not null,
  qty         integer not null default 1,
  unit        text
);

alter table order_items enable row level security;

create policy "Users can read own order items" on order_items for select using (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);
create policy "Auth users can insert order items" on order_items for insert with check (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);

-- ============================================================
-- vendor_bank_accounts
-- ============================================================
create table if not exists vendor_bank_accounts (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid not null references profiles(id) on delete cascade unique,
  bank_name      text not null,
  account_name   text not null,
  account_number text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table vendor_bank_accounts enable row level security;

create policy "Users can manage own bank account"
  on vendor_bank_accounts for all using (auth.uid() = user_id);

create policy "Admins can read all bank accounts"
  on vendor_bank_accounts for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

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

-- ============================================================
-- resources
-- ============================================================
create table if not exists resources (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  description text,
  url         text,
  category    text,
  user_id     uuid references profiles(id),
  created_at  timestamptz default now()
);

alter table resources enable row level security;

create policy "Anyone can read resources" on resources for select using (true);
create policy "Admins can manage resources" on resources for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
