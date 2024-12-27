-- Drop existing tables
drop table if exists public.store_users cascade;
drop table if exists public.stores cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.tracking_entries cascade;
drop table if exists public.removal_orders cascade;
drop table if exists public.spreadsheets cascade;
drop table if exists public.pullback_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.items cascade;

-- Create tables
create table public.stores (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    code text not null unique,
    created_by uuid references auth.users,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_profiles (
    id uuid references auth.users primary key,
    email text unique not null,
    role text not null check (role in ('admin', 'manager', 'employee')),
    permissions jsonb default '{}'::jsonb,
    store_ids uuid[] default array[]::uuid[],
    managed_stores uuid[] default array[]::uuid[],
    created_by uuid references auth.users,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.spreadsheets (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    file_name text not null,
    row_count integer default 0,
    status text not null check (status in ('processing', 'completed', 'failed')) default 'processing',
    store_id uuid references public.stores not null,
    uploaded_by uuid references auth.users not null,
    type text not null check (type in ('removal', 'tracking')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Base items table for dashboard
create table public.items (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores not null,
    spreadsheet_id uuid references public.spreadsheets not null,
    sku text not null,
    fnsku text,
    disposition text,
    shipped_quantity integer not null,
    requested_quantity integer not null,
    actual_return_qty integer default 0,
    status text not null check (status in ('new', 'processing', 'completed', 'cancelled')) default 'new',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Working items table
create table public.pullback_items (
    id uuid default gen_random_uuid() primary key,
    item_id uuid references public.items not null,
    spreadsheet_id uuid references public.spreadsheets not null,
    store_id uuid references public.stores not null,
    request_date timestamp with time zone,
    order_id text not null,
    shipment_date timestamp with time zone,
    carrier text,
    tracking_number text,
    removal_order_type text,
    processing_status text default 'new' check (processing_status in ('new', 'processing', 'completed', 'cancelled')),
    notes text,
    tracking_numbers text[] default array[]::text[],
    carriers text[] default array[]::text[],
    created_by uuid references auth.users,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Completed orders table
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    item_id uuid references public.items not null,
    store_id uuid references public.stores not null,
    spreadsheet_id uuid references public.spreadsheets not null,
    order_id text not null,
    processing_status text default 'completed' check (processing_status in ('completed', 'cancelled')),
    processing_date timestamp with time zone not null,
    tracking_numbers text[] default array[]::text[],
    carriers text[] default array[]::text[],
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.stores enable row level security;
alter table public.user_profiles enable row level security;
alter table public.spreadsheets enable row level security;
alter table public.items enable row level security;
alter table public.pullback_items enable row level security;
alter table public.orders enable row level security;

-- Create indexes for performance
create index idx_items_status on public.items(status);
create index idx_items_store on public.items(store_id);
create index idx_pullback_status on public.pullback_items(processing_status);
create index idx_pullback_store on public.pullback_items(store_id);
create index idx_orders_store on public.orders(store_id);