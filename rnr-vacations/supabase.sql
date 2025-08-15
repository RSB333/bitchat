create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  stripe_account_id text,
  created_at timestamptz default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  type text check (type in ('hotel','timeshare')) not null,
  name text not null,
  description text,
  city text not null,
  country text not null,
  area text,
  rating numeric,
  price_per_night numeric not null,
  hero_image_url text,
  images text[] default '{}',
  amenities text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key,
  listing_id uuid references listings(id) on delete cascade,
  guest_id uuid references auth.users,
  start_date date not null,
  end_date date not null,
  guests int not null,
  status text check (status in ('pending','paid','cancelled','refunded')) default 'pending',
  total_amount numeric not null,
  created_at timestamptz default now()
);

-- Threaded messaging
create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  host_id uuid references auth.users,
  guest_id uuid references auth.users,
  created_at timestamptz default now()
);
create unique index if not exists uniq_threads on threads(listing_id, host_id, guest_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  sender_id uuid references auth.users,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  author_id uuid references auth.users,
  rating int check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table bookings enable row level security;
alter table threads enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;

create policy "Public read listings" on listings for select using (true);
create policy "Host owns listing" on listings for insert with check (auth.uid() = owner_id);
create policy "Host updates own listing" on listings for update using (auth.uid() = owner_id);

create policy "Guest can insert booking" on bookings for insert with check (auth.uid() = guest_id);
create policy "Host/Guest can read booking" on bookings for select using (
  auth.uid() = guest_id or auth.uid() in (select owner_id from listings where id = bookings.listing_id)
);

create policy "Participants read threads" on threads for select using (
  auth.uid() = host_id or auth.uid() = guest_id
);
create policy "Participants insert threads" on threads for insert with check (
  auth.uid() = host_id or auth.uid() = guest_id
);

create policy "Participants read messages" on messages for select using (
  auth.uid() in (select host_id from threads where id = messages.thread_id)
  or auth.uid() in (select guest_id from threads where id = messages.thread_id)
);
create policy "Participants write messages" on messages for insert with check (
  auth.uid() = sender_id and (
    auth.uid() in (select host_id from threads where id = messages.thread_id)
    or auth.uid() in (select guest_id from threads where id = messages.thread_id)
  )
);

create policy "Public read reviews" on reviews for select using (true);
create policy "Auth insert reviews" on reviews for insert with check (auth.uid() = author_id);