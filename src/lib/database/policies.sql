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

-- Drop the existing init_database function if it exists
DROP FUNCTION IF EXISTS init_database();

-- Function to initialize database with a success message
create or replace function init_database()
returns text as $$
begin
  -- First clean everything
  perform list_and_drop_all();
  
  -- Create basic policies for user_profiles first
  create policy "Enable read access for authenticated users"
    on public.user_profiles
    for select
    to authenticated
    using (true);

  create policy "Enable insert for authenticated users"
    on public.user_profiles
    for insert
    to authenticated
    with check (auth.uid() = id);

  create policy "Enable update for users based on email"
    on public.user_profiles
    for update
    to authenticated
    using (
      auth.uid() = id 
      or 
      auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com'
    );

  create policy "Enable delete for admin email"
    on public.user_profiles
    for delete
    to authenticated
    using (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  -- Stores policies
  create policy "Enable read access for all authenticated users"
    on public.stores
    for select
    to authenticated
    using (true);

  create policy "Enable insert for admin email"
    on public.stores
    for insert
    to authenticated
    with check (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  create policy "Enable update for admin email"
    on public.stores
    for update
    to authenticated
    using (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  create policy "Enable delete for admin email"
    on public.stores
    for delete
    to authenticated
    using (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  -- Spreadsheets policies
  create policy "Enable read access for authenticated users"
    on public.spreadsheets
    for select
    to authenticated
    using (true);

  create policy "Enable insert for authenticated users"
    on public.spreadsheets
    for insert
    to authenticated
    with check (true);

  create policy "Enable update for authenticated users"
    on public.spreadsheets
    for update
    to authenticated
    using (true);

  create policy "Enable delete for admin email"
    on public.spreadsheets
    for delete
    to authenticated
    using (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  -- Create pullback_items policies
  CREATE POLICY "Allow all authenticated access to pullback_items"
    ON public.pullback_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

  -- Create items policies
  create policy "Enable read access for authenticated users"
    on public.items
    for select
    to authenticated
    using (true);

  create policy "Enable insert for authenticated users"
    on public.items
    for insert
    to authenticated
    with check (true);

  create policy "Enable update for authenticated users"
    on public.items
    for update
    to authenticated
    using (true);

  create policy "Enable delete for admin email"
    on public.items
    for delete
    to authenticated
    using (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  -- Create orders policies
  create policy "Enable read access for authenticated users"
    on public.orders
    for select
    to authenticated
    using (true);

  create policy "Enable insert for authenticated users"
    on public.orders
    for insert
    to authenticated
    with check (true);

  create policy "Enable update for authenticated users"
    on public.orders
    for update
    to authenticated
    using (true);

  create policy "Enable delete for admin email"
    on public.orders
    for delete
    to authenticated
    using (auth.jwt()->>'email' = 'digitalmarketinghelpers@gmail.com');

  return 'Database policies initialized successfully.';
end;
$$ language plpgsql security definer;

-- Call init_database function to execute all
select init_database();