-- Create carts table (matching supabase.txt)
create table if not exists carts (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid unique references public.customers(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create cart_items table (matching supabase.txt)
create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  cart_id uuid references public.carts(id),
  product_id uuid references public.products(id),
  seller_id uuid references public.profiles(id),
  quantity integer not null check (quantity > 0),
  price_at_addition numeric not null,
  added_at timestamp with time zone default now(),
  unique(cart_id, product_id) -- Added unique constraint for logic consistency
);

-- Enable RLS
alter table carts enable row level security;
alter table cart_items enable row level security;

-- Policies for carts
create policy "Users can view their own cart"
  on carts for select
  using (auth.uid() = customer_id);

create policy "Users can create their own cart"
  on carts for insert
  with check (auth.uid() = customer_id);

-- Policies for cart_items
create policy "Users can view their own cart items"
  on cart_items for select
  using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
      and carts.customer_id = auth.uid()
    )
  );

create policy "Users can insert items into their own cart"
  on cart_items for insert
  with check (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
      and carts.customer_id = auth.uid()
    )
  );

create policy "Users can update items in their own cart"
  on cart_items for update
  using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
      and carts.customer_id = auth.uid()
    )
  );

create policy "Users can delete items from their own cart"
  on cart_items for delete
  using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
      and carts.customer_id = auth.uid()
    )
  );
