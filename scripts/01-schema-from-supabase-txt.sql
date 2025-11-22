-- 01-schema-from-supabase-txt.sql
-- Fresh schema for new Supabase project, based on supabase.txt.
-- Run this in Supabase SQL editor on a new project.

-- 0. Extensions (for gen_random_uuid)
create extension if not exists "pgcrypto";

-- 1. Profiles (depends on auth.users)
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text not null unique,
  phone text,
  full_name text,
  role text not null check (role = any (array['customer','retailer','wholesaler','delivery'])),
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Role tables
create table if not exists public.customers (
  id uuid not null primary key references public.profiles(id) on delete cascade,
  street_address text,
  city text,
  state text,
  pincode text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

create table if not exists public.retailers (
  id uuid not null primary key references public.profiles(id) on delete cascade,
  shop_name text not null,
  shop_address text,
  shop_city text,
  shop_state text,
  shop_pincode text,
  shop_latitude numeric,
  shop_longitude numeric,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.wholesalers (
  id uuid not null primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  business_address text,
  business_city text,
  business_state text,
  business_pincode text,
  business_latitude numeric,
  business_longitude numeric,
  gst_number text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.delivery_persons (
  id uuid not null primary key references public.profiles(id) on delete cascade,
  vehicle_type text check (vehicle_type = any (array['bike','scooter','van','truck'])),
  vehicle_number text,
  license_number text,
  current_latitude numeric,
  current_longitude numeric,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- 3. Categories & products
create table if not exists public.categories (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id),
  image_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text,
  category_id uuid references public.categories(id),
  sku text unique,
  base_price numeric,
  unit text default 'piece',
  specifications jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid not null default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- 4. Inventory, carts, cart_items, wishlists
create table if not exists public.inventory (
  id uuid not null default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  owner_type text not null check (owner_type = any (array['retailer','wholesaler'])),
  quantity integer not null default 0 check (quantity >= 0),
  price numeric not null,
  mrp numeric,
  is_available boolean default true,
  low_stock_threshold integer default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.carts (
  id uuid not null default gen_random_uuid() primary key,
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.cart_items (
  id uuid not null default gen_random_uuid() primary key,
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  price_at_addition numeric not null,
  added_at timestamptz default now()
);

create table if not exists public.wishlists (
  id uuid not null default gen_random_uuid() primary key,
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  added_at timestamptz default now()
);

-- 5. RLS basics (match earlier schema behaviour, can adjust later)
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

alter table public.categories enable row level security;
create policy "Categories are public" on public.categories
  for select using (true);

alter table public.products enable row level security;
create policy "Products are public" on public.products
  for select using (true);

alter table public.product_images enable row level security;
create policy "Product images are public" on public.product_images
  for select using (true);

alter table public.inventory enable row level security;
create policy "Inventory is public" on public.inventory
  for select using (true);

alter table public.customers enable row level security;
create policy "Customers manage own data" on public.customers
  for all using (auth.uid() = id);

alter table public.retailers enable row level security;
create policy "Retailers manage own data" on public.retailers
  for all using (auth.uid() = id);

alter table public.wholesalers enable row level security;
create policy "Wholesalers manage own data" on public.wholesalers
  for all using (auth.uid() = id);

alter table public.delivery_persons enable row level security;
create policy "Delivery manage own data" on public.delivery_persons
  for all using (auth.uid() = id);

alter table public.carts enable row level security;
create policy "Customers manage own cart" on public.carts
  for all using (auth.uid() = customer_id);

alter table public.cart_items enable row level security;
create policy "Customers manage own cart items" on public.cart_items
  for all using ((select customer_id from public.carts where id = cart_id) = auth.uid());

alter table public.wishlists enable row level security;
create policy "Customers manage wishlists" on public.wishlists
  for all using (auth.uid() = customer_id);

-- 6. Trigger: auto-cart creation for new customers
create or replace function public.create_customer_cart()
returns trigger as $$
begin
  insert into public.carts (customer_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_customer_created
  after insert on public.customers
  for each row execute function public.create_customer_cart();

-- 7. Trigger: handle_new_user to populate profiles + role table
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_full_name text;
  user_phone text;
  retailer_shop_name text;
  wholesaler_business_name text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);
  user_phone := new.raw_user_meta_data->>'phone';
  retailer_shop_name := coalesce(new.raw_user_meta_data->>'shop_name', 'Untitled Shop');
  wholesaler_business_name := coalesce(new.raw_user_meta_data->>'business_name', 'Untitled Business');

  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, user_full_name, user_phone, user_role);

  if user_role = 'customer' then
    insert into public.customers (id) values (new.id);
  elsif user_role = 'retailer' then
    insert into public.retailers (id, shop_name) values (new.id, retailer_shop_name);
  elsif user_role = 'wholesaler' then
    insert into public.wholesalers (id, business_name) values (new.id, wholesaler_business_name);
  elsif user_role = 'delivery' then
    insert into public.delivery_persons (id) values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
