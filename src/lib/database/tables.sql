-- Drop existing tables if they exist
drop table if exists public.store_users cascade;
drop table if exists public.stores cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.tracking_entries cascade;
drop table if exists public.removal_orders cascade;
drop table if exists public.spreadsheets cascade;

-- Create tables
create table public.stores (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
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
  store_id uuid references public.stores not null,
  uploaded_by uuid references auth.users not null,
  type text not null check (type in ('removal', 'tracking')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.tracking_entries (
  id uuid default gen_random_uuid() primary key,
  spreadsheet_id uuid references public.spreadsheets not null,
  store_id uuid references public.stores not null,
  request_date timestamp with time zone,
  order_id text not null,
  shipment_date timestamp with time zone,
  tracking_number text,
  carrier text,
  shipped_quantity integer,
  processing_status text default 'new' check (processing_status in ('new', 'processing', 'completed')),
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.removal_orders (
  id uuid default gen_random_uuid() primary key,
  spreadsheet_id uuid references public.spreadsheets not null,
  store_id uuid references public.stores not null,
  order_id text not null,
  request_date timestamp with time zone,
  shipment_date timestamp with time zone,
  sku text not null,
  fnsku text,
  disposition text,
  shipped_quantity integer,
  requested_quantity integer,
  actual_return_qty integer default 0,
  carrier text,
  tracking_number text,
  removal_order_type text,
  processing_status text default 'new' check (processing_status in ('new', 'processing', 'completed')),
  notes text,
  items jsonb default '[]'::jsonb,
  tracking_numbers text[] default array[]::text[],
  carriers text[] default array[]::text[],
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.stores enable row level security;
alter table public.user_profiles enable row level security;
alter table public.spreadsheets enable row level security;
alter table public.tracking_entries enable row level security;
alter table public.removal_orders enable row level security;
