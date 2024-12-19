-- Create extension function
create or replace function create_extension(extension_name text)
returns void as $$
begin
  execute format('create extension if not exists %I', extension_name);
end;
$$ language plpgsql security definer;

-- Create stores table function
create or replace function create_stores_table()
returns void as $$
begin
  create table if not exists public.stores (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    code text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
end;
$$ language plpgsql security definer;

-- Create profiles table function
create or replace function create_profiles_table()
returns void as $$
begin
  create table if not exists public.user_profiles (
    id uuid primary key,
    email text unique not null,
    role text not null default 'employee',
    permissions jsonb not null default '{}'::jsonb,
    store_ids uuid[] default array[]::uuid[],
    managed_stores uuid[] default array[]::uuid[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Add foreign key reference after both tables exist
  alter table if not exists public.user_profiles
    add constraint fk_user_profiles_id
    foreign key (id) 
    references auth.users(id)
    on delete cascade;
    
  alter table if not exists public.user_profiles
    add constraint if not exists valid_role 
    check (role in ('admin', 'manager', 'employee'));
end;
$$ language plpgsql security definer;

-- Enable RLS function
create or replace function enable_rls()
returns void as $$
begin
  alter table public.stores enable row level security;
  alter table public.user_profiles enable row level security;
end;
$$ language plpgsql security definer;

-- Create RLS policies function
create or replace function create_rls_policies()
returns void as $$
begin
  -- Drop existing policies
  drop policy if exists "Public profiles are viewable by everyone" on public.user_profiles;
  drop policy if exists "Users can insert their own profile" on public.user_profiles;
  drop policy if exists "Users can update their own profile" on public.user_profiles;
  drop policy if exists "Stores are viewable by authenticated users" on public.stores;
  drop policy if exists "Only admins can manage stores" on public.stores;

  -- Create new policies
  create policy "Public profiles are viewable by everyone"
    on public.user_profiles for select
    using (true);

  create policy "Users can insert their own profile"
    on public.user_profiles for insert
    with check (auth.uid() = id);

  create policy "Users can update their own profile"
    on public.user_profiles for update
    using (auth.uid() = id);

  create policy "Stores are viewable by authenticated users"
    on public.stores for select
    using (auth.role() = 'authenticated');

  create policy "Only admins can manage stores"
    on public.stores for all
    using (
      exists (
        select 1 
        from public.user_profiles 
        where id = auth.uid() 
        and role = 'admin'
      )
    );
end;
$$ language plpgsql security definer;