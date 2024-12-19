-- List and drop all policies
create or replace function list_and_drop_all()
returns void as $$
declare
  policy_record record;
begin
  -- Drop all policies
  for policy_record in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  ) loop
    execute format('drop policy if exists %I on %I.%I', 
      policy_record.policyname, 
      policy_record.schemaname, 
      policy_record.tablename
    );
  end loop;
end;
$$ language plpgsql security definer;

-- Function to initialize database
create or replace function init_database()
returns void as $$
begin
  -- First clean everything
  perform list_and_drop_all();
end;
$$ language plpgsql security definer;

-- Drop all existing policies
do $$ 
begin
  -- Drop all policies from stores
  drop policy if exists "Admins can do everything with stores" on public.stores;
  drop policy if exists "Managers can manage their stores" on public.stores;
  drop policy if exists "Workers can view their assigned stores" on public.stores;
  
  -- Drop all policies from user_profiles
  drop policy if exists "Users can see their own profile" on public.user_profiles;
  drop policy if exists "Admins can manage all profiles" on public.user_profiles;
  drop policy if exists "Managers can view and update their workers" on public.user_profiles;
  drop policy if exists "Allow users to create their initial profile" on public.user_profiles;
  drop policy if exists "Allow authenticated users to read profiles" on public.user_profiles;
  drop policy if exists "Allow manager worker select" on public.user_profiles;
  drop policy if exists "Allow manager worker update" on public.user_profiles;
  drop policy if exists "Allow manager worker delete" on public.user_profiles;
end $$;

-- Create stores policies
create policy "Admins can do everything with stores"
  on public.stores
  as permissive
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
      and user_profiles.role = 'admin'
    )
  );

create policy "Managers can manage their stores"
  on public.stores
  as permissive
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
      and user_profiles.role = 'manager'
      and stores.created_by = user_profiles.id
    )
  );

create policy "Workers can view their assigned stores"
  on public.stores
  as permissive
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
      and user_profiles.role = 'employee'
      and stores.id = any(user_profiles.store_ids)
    )
  );

-- Create user_profiles policies with simplified access control
create policy "Allow initial profile access"
  on public.user_profiles
  as permissive
  for select
  to authenticated
  using (true);

create policy "Allow self profile management"
  on public.user_profiles
  as permissive
  for all
  to authenticated
  using (id = auth.uid());

create policy "Allow admin full access"
  on public.user_profiles
  as permissive
  for all
  to authenticated
  using (
    exists (
      select 1 
      from auth.users 
      where auth.users.id = auth.uid() 
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Split manager worker access into separate policies for each operation
create policy "Allow manager worker select"
  on public.user_profiles
  as permissive
  for select
  to authenticated
  using (
    created_by = auth.uid() 
    and role = 'employee'
    and exists (
      select 1 
      from auth.users 
      where auth.users.id = auth.uid() 
      and auth.users.raw_user_meta_data->>'role' = 'manager'
    )
  );

create policy "Allow manager worker update"
  on public.user_profiles
  as permissive
  for update
  to authenticated
  using (
    created_by = auth.uid() 
    and role = 'employee'
    and exists (
      select 1 
      from auth.users 
      where auth.users.id = auth.uid() 
      and auth.users.raw_user_meta_data->>'role' = 'manager'
    )
  );

create policy "Allow manager worker delete"
  on public.user_profiles
  as permissive
  for delete
  to authenticated
  using (
    created_by = auth.uid() 
    and role = 'employee'
    and exists (
      select 1 
      from auth.users 
      where auth.users.id = auth.uid() 
      and auth.users.raw_user_meta_data->>'role' = 'manager'
    )
  );

-- First create a function to check admin status that uses auth.users directly
create or replace function auth.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select 
    exists (
      select 1 from auth.users 
      where id = auth.uid() 
      and (
        -- Check metadata for admin role
        raw_user_meta_data->>'role' = 'admin'
        or 
        -- Also check email for bootstrap case
        email = 'digitalmarketinghelpers@gmail.com'
      )
    )
$$;

-- Allow initial admin setup
create policy "Allow initial admin setup"
  on public.user_profiles
  as permissive
  for insert
  to authenticated
  with check (
    auth.is_admin()
    or 
    (id = auth.uid() and email = 'digitalmarketinghelpers@gmail.com')
  );

-- Admin read access
create policy "Admins can read all profiles"
  on public.user_profiles
  for select
  to authenticated
  using (
    auth.is_admin()
    or auth.uid() = id
  );

-- Admin write access
create policy "Admins can manage all profiles"
  on public.user_profiles
  as permissive
  for all
  to authenticated
  using (auth.is_admin());

-- Users can read their own profile
create policy "Users can read own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);