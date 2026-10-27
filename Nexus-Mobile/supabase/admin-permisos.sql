-- Ejecutar DESPUÉS de cotizaciones-permisos.sql en SQL Editor.
begin;
create table if not exists public.administradores (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;
grant select on public.administradores to authenticated;
drop policy if exists "Consultar mi permiso" on public.administradores;
create policy "Consultar mi permiso" on public.administradores
  for select to authenticated using (user_id = (select auth.uid()));

insert into public.administradores (user_id)
values ('997590ba-e54d-4286-a098-7bac3b2c960d')
on conflict (user_id) do nothing;

alter table public.cotizaciones enable row level security;
grant select on public.cotizaciones to authenticated;
grant update (estado) on public.cotizaciones to authenticated;
drop policy if exists "Admin consulta cotizaciones" on public.cotizaciones;
create policy "Admin consulta cotizaciones" on public.cotizaciones
  for select to authenticated using (
    exists (select 1 from public.administradores where user_id = (select auth.uid()))
  );
drop policy if exists "Admin actualiza estado" on public.cotizaciones;
create policy "Admin actualiza estado" on public.cotizaciones
  for update to authenticated
  using (exists (select 1 from public.administradores where user_id = (select auth.uid())))
  with check (
    exists (select 1 from public.administradores where user_id = (select auth.uid()))
    and estado in ('pendiente', 'contactada', 'atendida', 'cancelada')
  );
commit;
