-- Ejecutar después de admin-permisos.sql. No modifica cotizaciones.
begin;
create table if not exists public.productos (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand text not null default '',
  model text not null default '',
  name text not null check (char_length(btrim(name)) > 0),
  tag text,
  description text not null default '',
  -- Se preserva el formato comercial actual. No usar como importe para pagos.
  price text not null check (char_length(btrim(price)) > 0),
  "oldPrice" text,
  "monthlyPayment" text,
  image text not null,
  gallery jsonb not null default '[]' check (jsonb_typeof(gallery) = 'array'),
  capacities jsonb not null default '[]' check (jsonb_typeof(capacities) = 'array'),
  colors jsonb not null default '[]' check (jsonb_typeof(colors) = 'array'),
  "simTypes" jsonb not null default '[]' check (jsonb_typeof("simTypes") = 'array'),
  specs jsonb not null default '[]' check (jsonb_typeof(specs) = 'array'),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.productos enable row level security;
revoke all on public.productos from anon, authenticated;
grant select on public.productos to anon, authenticated;
grant insert, update, delete on public.productos to authenticated;

drop policy if exists "Catalogo publico" on public.productos;
create policy "Catalogo publico" on public.productos
  for select to anon, authenticated using (active);

drop policy if exists "Admin administra catalogo" on public.productos;
create policy "Admin administra catalogo" on public.productos
  for all to authenticated
  using (exists (select 1 from public.administradores where user_id = (select auth.uid())))
  with check (exists (select 1 from public.administradores where user_id = (select auth.uid())));
commit;
