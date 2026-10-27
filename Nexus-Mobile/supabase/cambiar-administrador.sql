-- Ejecutar en Supabase > SQL Editor después de admin-permisos.sql.
-- Si el nuevo usuario no existe, la transacción no aplica ningún cambio.
begin;

insert into public.administradores (user_id)
values ('5218e699-3d18-48c5-9dd3-72a705ef3ed3')
on conflict (user_id) do nothing;

delete from public.administradores
where user_id = '997590ba-e54d-4286-a098-7bac3b2c960d';

commit;
