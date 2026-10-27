-- Ejecutar en SQL Editor después de crear public.cotizaciones.
begin;

alter table public.cotizaciones enable row level security;
alter table public.cotizaciones
  alter column id set default gen_random_uuid(),
  alter column created_at set default now(),
  alter column estado set default 'pendiente';

-- Los visitantes solo pueden enviar los campos del formulario.
-- No se habilita lectura, edición ni eliminación de solicitudes.
revoke all privileges on table public.cotizaciones from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant insert (nombre, telefono, email, interes, mensaje,
  producto_id, producto_nombre, capacidad, color, tipo_sim)
  on public.cotizaciones to anon, authenticated;

drop policy if exists "Enviar cotizaciones" on public.cotizaciones;
create policy "Enviar cotizaciones"
  on public.cotizaciones for insert to anon, authenticated
  with check (
    nombre is not null and char_length(btrim(nombre)) between 2 and 200
    and telefono is not null and telefono ~ '^[0-9]{10}$'
    and email is not null and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    and interes is not null
    and interes in ('linea-nueva', 'portabilidad', 'equipo', 'empresarial')
    and (mensaje is null or char_length(mensaje) <= 5000)
    and estado = 'pendiente'
  );

commit;
