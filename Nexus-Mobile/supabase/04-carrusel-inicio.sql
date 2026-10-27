-- Ejecutar en SQL Editor. Requiere administradores y el bucket catalogo (03).
begin;
create table if not exists public.carrusel_inicio (
  id integer primary key check (id = 1),
  images text[] not null default '{}' check (cardinality(images) <= 20)
);
insert into public.carrusel_inicio (id) values (1) on conflict do nothing;
alter table public.carrusel_inicio enable row level security;
revoke all on public.carrusel_inicio from anon, authenticated;
grant select on public.carrusel_inicio to anon, authenticated;
grant update (images) on public.carrusel_inicio to authenticated;
drop policy if exists "Ver carrusel inicio" on public.carrusel_inicio;
create policy "Ver carrusel inicio" on public.carrusel_inicio
  for select to anon, authenticated using (true);
drop policy if exists "Admin edita carrusel inicio" on public.carrusel_inicio;
create policy "Admin edita carrusel inicio" on public.carrusel_inicio
  for update to authenticated
  using (exists (select 1 from public.administradores where user_id = (select auth.uid())))
  with check (exists (select 1 from public.administradores where user_id = (select auth.uid())));
commit;
