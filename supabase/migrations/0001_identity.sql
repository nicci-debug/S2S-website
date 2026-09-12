-- Zumi: identity — users, parent_profiles, children, child_learning_priorities
create extension if not exists "pgcrypto";

-- Mirrors auth.users so app code has a place to hang a role without
-- touching the `auth` schema directly.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  created_at timestamptz not null default now()
);

create table public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  display_name text not null,
  locale text not null default 'en-ZA',
  timezone text not null default 'Africa/Johannesburg',
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  age int not null check (age between 4 and 14),
  grade text,
  home_language text not null default 'en-ZA',
  avatar_id text not null default 'fox',
  total_xp int not null default 0 check (total_xp >= 0),
  level int not null default 1 check (level >= 1),
  current_streak int not null default 0 check (current_streak >= 0),
  longest_streak int not null default 0 check (longest_streak >= 0),
  created_at timestamptz not null default now()
);

create index children_parent_id_idx on public.children (parent_id);

-- Handles new Supabase Auth signups: mirror into public.users automatically.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
