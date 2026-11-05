-- Ejecutar DESPUÉS de 05-portal-clientes.sql en SQL Editor.
-- Usa datos ficticios dentro de una transacción y termina con ROLLBACK.
begin;
insert into auth.users (id, email) values
 ('aa000000-0000-4000-8000-000000000001', 'portal-test-a@example.invalid'),
 ('aa000000-0000-4000-8000-000000000002', 'portal-test-b@example.invalid'),
 ('aa000000-0000-4000-8000-000000000003', 'portal-test-admin@example.invalid');
insert into public.administradores(user_id) values ('aa000000-0000-4000-8000-000000000003');
insert into public.clientes (id,rfc,nombre,email) values
 ('aa000000-0000-4000-8000-000000000001','AAA010101AAA','Cliente A','portal-test-a@example.invalid'),
 ('aa000000-0000-4000-8000-000000000002','BBB010101BBB','Cliente B','portal-test-b@example.invalid');
insert into public.cliente_lineas(cliente_id,numero) values
 ('aa000000-0000-4000-8000-000000000001','5500000001'),
 ('aa000000-0000-4000-8000-000000000002','5500000002');
insert into public.cliente_adendas(cliente_id,titulo) values
 ('aa000000-0000-4000-8000-000000000001','Adenda A'),
 ('aa000000-0000-4000-8000-000000000002','Adenda B');
insert into public.cliente_tramites(cliente_id,titulo) values
 ('aa000000-0000-4000-8000-000000000001','Trámite A'),
 ('aa000000-0000-4000-8000-000000000002','Trámite B');

set local role authenticated;
select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000001',true);
do $$
declare count_rows integer; table_name text;
begin
  select count(*) into count_rows from public.clientes;
  if count_rows <> 1 then raise exception 'El cliente no está aislado'; end if;
  foreach table_name in array array['cliente_lineas','cliente_adendas','cliente_tramites'] loop
    execute format('select count(*) from public.%I', table_name) into count_rows;
    if count_rows <> 1 then raise exception 'Filtrado incorrecto en %', table_name; end if;
    execute format('update public.%I set estado = ''Alterado''', table_name);
    get diagnostics count_rows = row_count;
    if count_rows <> 0 then raise exception 'Un cliente pudo editar %', table_name; end if;
    execute format('delete from public.%I', table_name);
    get diagnostics count_rows = row_count;
    if count_rows <> 0 then raise exception 'Un cliente pudo borrar %', table_name; end if;
  end loop;
  begin
    insert into public.cliente_lineas(cliente_id,numero) values ('aa000000-0000-4000-8000-000000000001','5500000003');
    raise exception 'El cliente pudo crear líneas';
  exception when insufficient_privilege then null; end;
  begin
    perform public.portal_admitir_intento('test',10,900);
    raise exception 'El cliente pudo modificar límites';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000003',true);
do $$
declare total integer;
begin
  select count(*) into total from public.clientes where id in ('aa000000-0000-4000-8000-000000000001','aa000000-0000-4000-8000-000000000002');
  if total <> 2 then raise exception 'El administrador no ve clientes'; end if;
  update public.clientes set active = false where id = 'aa000000-0000-4000-8000-000000000001';
  get diagnostics total = row_count;
  if total <> 1 then raise exception 'El administrador no puede desactivar'; end if;
end $$;
select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000001',true);
do $$
declare total integer;
begin
  select count(*) into total from public.cliente_lineas;
  if total <> 0 then raise exception 'Una cuenta inactiva puede ver líneas'; end if;
  select count(*) into total from public.cliente_adendas;
  if total <> 0 then raise exception 'Una cuenta inactiva puede ver adendas'; end if;
  select count(*) into total from public.cliente_tramites;
  if total <> 0 then raise exception 'Una cuenta inactiva puede ver trámites'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
  begin
    perform id from public.clientes;
    raise exception 'Un visitante puede leer perfiles';
  exception when insufficient_privilege then null; end;
  begin
    perform id from public.cliente_lineas;
    raise exception 'Un visitante puede leer líneas';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
