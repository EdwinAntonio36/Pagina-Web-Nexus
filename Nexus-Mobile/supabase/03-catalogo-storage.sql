-- Ejecutar en SQL Editor. Requiere public.administradores.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalogo', 'catalogo', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Las fotos del catálogo son públicas. Las subidas requieren un administrador.
-- Cada subida tiene un nombre único y no sobrescribe archivos anteriores.
drop policy if exists "Admin sube imagenes catalogo" on storage.objects;
create policy "Admin sube imagenes catalogo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'catalogo'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.administradores where user_id = (select auth.uid()))
  );
commit;
