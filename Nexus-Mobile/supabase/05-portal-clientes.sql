-- Base del portal de clientes. No importa ni modifica Google Sheets.
begin;
grant select on public.administradores to service_role;
create table if not exists public.clientes (
  id uuid primary key references auth.users(id) on delete cascade,
  rfc text not null unique check (rfc ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
  nombre text not null check (length(btrim(nombre)) between 2 and 200),
  email text not null,
  active boolean not null default true,
  external_id text unique,
  created_at timestamptz not null default now()
);
create table if not exists public.cliente_lineas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  numero text not null check (length(btrim(numero)) between 1 and 30),
  plan text not null default '',
  estado text not null default 'Activa',
  notas text not null default '',
  external_id text unique,
  created_at timestamptz not null default now()
);
create table if not exists public.cliente_adendas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null check (length(btrim(titulo)) between 1 and 200),
  estado text not null default 'Vigente',
  fecha date,
  notas text not null default '',
  external_id text unique,
  created_at timestamptz not null default now()
);
create table if not exists public.cliente_tramites (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null check (length(btrim(titulo)) between 1 and 200),
  estado text not null default 'Pendiente',
  fecha date,
  notas text not null default '',
  external_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists cliente_lineas_owner on public.cliente_lineas(cliente_id);
create index if not exists cliente_adendas_owner on public.cliente_adendas(cliente_id);
create index if not exists cliente_tramites_owner on public.cliente_tramites(cliente_id);

alter table public.clientes enable row level security;
revoke all on public.clientes from anon, authenticated;
grant select on public.clientes to authenticated;
grant update (nombre, active, external_id) on public.clientes to authenticated;
drop policy if exists "Cliente consulta perfil" on public.clientes;
create policy "Cliente consulta perfil" on public.clientes for select to authenticated
  using (id = (select auth.uid()) and active);
drop policy if exists "Admin consulta clientes" on public.clientes;
create policy "Admin consulta clientes" on public.clientes for select to authenticated
  using (exists (select 1 from public.administradores where user_id = (select auth.uid())));
drop policy if exists "Admin actualiza clientes" on public.clientes;
create policy "Admin actualiza clientes" on public.clientes for update to authenticated
  using (exists (select 1 from public.administradores where user_id = (select auth.uid())))
  with check (exists (select 1 from public.administradores where user_id = (select auth.uid())));

-- Las mismas reglas protegen líneas, adendas y trámites, también por API directa.
do $$
declare table_name text;
begin
  foreach table_name in array array['cliente_lineas','cliente_adendas','cliente_tramites'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('drop policy if exists "Cliente consulta sus datos" on public.%I', table_name);
    execute format('create policy "Cliente consulta sus datos" on public.%I for select to authenticated using
      (exists (select 1 from public.clientes c where c.id = cliente_id and c.id = (select auth.uid()) and c.active))', table_name);
    execute format('drop policy if exists "Admin administra datos cliente" on public.%I', table_name);
    execute format('create policy "Admin administra datos cliente" on public.%I for all to authenticated
      using (exists (select 1 from public.administradores where user_id = (select auth.uid())))
      with check (exists (select 1 from public.administradores where user_id = (select auth.uid())))', table_name);
  end loop;
end $$;

-- Límites persistentes de intentos, accesibles únicamente desde las funciones.
create table if not exists public.portal_intentos (
  clave text primary key, inicio timestamptz not null, cantidad integer not null
);
alter table public.portal_intentos enable row level security;
revoke all on public.portal_intentos from public, anon, authenticated;
create or replace function public.portal_admitir_intento(p_clave text, p_max integer, p_segundos integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare total integer;
begin
  delete from public.portal_intentos where inicio < now() - interval '1 day';
  insert into public.portal_intentos as intentos (clave, inicio, cantidad)
  values (p_clave, now(), 1)
  on conflict (clave) do update set
    inicio = case when intentos.inicio < now() - make_interval(secs => p_segundos) then now() else intentos.inicio end,
    cantidad = case when intentos.inicio < now() - make_interval(secs => p_segundos) then 1 else intentos.cantidad + 1 end
  returning cantidad into total;
  return total <= p_max;
end $$;
revoke all on function public.portal_admitir_intento(text, integer, integer) from public, anon, authenticated;
grant execute on function public.portal_admitir_intento(text, integer, integer) to service_role;
grant all on public.clientes, public.cliente_lineas, public.cliente_adendas, public.cliente_tramites, public.portal_intentos to service_role;
commit;
