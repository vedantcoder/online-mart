-- Fix delivery person registration to save vehicle details
-- This updates the handle_new_user() trigger to extract and save delivery person details

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_full_name text;
  user_phone text;
  retailer_shop_name text;
  wholesaler_business_name text;
  delivery_vehicle_type text;
  delivery_vehicle_number text;
  delivery_license_number text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);
  user_phone := new.raw_user_meta_data->>'phone';
  retailer_shop_name := coalesce(new.raw_user_meta_data->>'shop_name', 'Untitled Shop');
  wholesaler_business_name := coalesce(new.raw_user_meta_data->>'business_name', 'Untitled Business');
  
  -- Extract delivery person details
  delivery_vehicle_type := new.raw_user_meta_data->>'vehicle_type';
  delivery_vehicle_number := new.raw_user_meta_data->>'vehicle_number';
  delivery_license_number := new.raw_user_meta_data->>'license_number';

  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, user_full_name, user_phone, user_role);

  if user_role = 'customer' then
    insert into public.customers (id) values (new.id);
  elsif user_role = 'retailer' then
    insert into public.retailers (id, shop_name) values (new.id, retailer_shop_name);
  elsif user_role = 'wholesaler' then
    insert into public.wholesalers (id, business_name) values (new.id, wholesaler_business_name);
  elsif user_role = 'delivery' then
    insert into public.delivery_persons (
      id, 
      vehicle_type, 
      vehicle_number, 
      license_number,
      is_available
    ) values (
      new.id, 
      delivery_vehicle_type, 
      delivery_vehicle_number, 
      delivery_license_number,
      true
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Note: Trigger already exists, this just replaces the function
