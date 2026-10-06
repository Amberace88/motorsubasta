-- ============================================================
-- Permisos de las API roles (se perdieron al recrear el esquema public)
-- Las políticas RLS siguen decidiendo QUÉ filas se ven; esto solo
-- devuelve el permiso de tabla que PostgREST necesita.
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;

-- lectura pública: catálogo y pujas (RLS filtra las filas)
grant select on auctions, vehicles, bids, listings, profiles, fee_tiers to anon;

-- usuarios autenticados: trabajan con sus propios datos
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- y lo mismo para lo que se cree a partir de ahora
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant all on tables to authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

-- comprobación: ninguna tabla puede quedarse sin RLS
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' order by rowsecurity, tablename;
