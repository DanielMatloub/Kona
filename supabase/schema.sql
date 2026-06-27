-- ============================================
-- KONA DATABASE SCHEMA
-- ============================================

-- ============================================
-- TABLES
-- ============================================

create table if not exists coffee_shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  google_place_id text unique,
  lat numeric,
  lon numeric,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  shop_id uuid references coffee_shops(id) on delete cascade,
  stars numeric(2,1) check (stars >= 0.5 and stars <= 5.0),
  drink_ordered text,
  visited_at date,
  created_at timestamptz default now()
);

create table if not exists want_to_visit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  shop_id uuid references coffee_shops(id) on delete cascade,
  unique(user_id, shop_id)
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Coffee shops
alter table coffee_shops enable row level security;

create policy "Coffee shops are viewable by everyone"
  on coffee_shops for select using (true);

create policy "Logged in users can add coffee shops"
  on coffee_shops for insert
  with check (auth.uid() is not null);

create policy "Logged in users can upsert coffee shops"
  on coffee_shops for update
  using (auth.uid() is not null);

-- Ratings
alter table ratings enable row level security;

create policy "Ratings are viewable by everyone"
  on ratings for select using (true);

create policy "Users can insert their own ratings"
  on ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ratings"
  on ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ratings"
  on ratings for delete
  using (auth.uid() = user_id);

-- Want to visit
alter table want_to_visit enable row level security;

create policy "Users can view their own want to visit"
  on want_to_visit for select
  using (auth.uid() = user_id);

create policy "Users can insert their own want to visit"
  on want_to_visit for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own want to visit"
  on want_to_visit for delete
  using (auth.uid() = user_id);