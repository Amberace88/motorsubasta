-- ============================================================
-- 05 · SOLO DESARROLLO — la demo sigue viva cada día
-- Reprograma las subastas del vendedor de demostración en la
-- sesión de su categoría (hora de Madrid) y cierra las reales.
-- Antes del lanzamiento:  select cron.unschedule('motorsubasta-tick');
-- ============================================================
create or replace function public.demo_roll_auctions() returns int
language plpgsql security definer set search_path = public as $$
declare
  n   int := 0;
  a   record;
  hoy date := (now() at time zone 'Europe/Madrid')::date;
  h1  int; h2 int; s timestamptz; e timestamptz;
begin
  for a in
    select au.id, au.vehicle_id, au.session, au.starts_at, au.ends_at
      from auctions au
      join vehicles v on v.id = au.vehicle_id
      join profiles p on p.id = v.seller_id
     where p.email = 'vendedor@demo.es'
       and au.status <> 'cancelada'
       and not (now() >= au.starts_at and now() < au.ends_at)   -- las que están en directo no se tocan
  loop
    h1 := case a.session when 'limpio' then 11 when 'danado' then 13 when 'siniestro' then 15 else 11 end;
    h2 := case a.session when 'limpio' then 13 when 'danado' then 15 when 'siniestro' then 16 else 16 end;
    s  := (hoy + make_time(h1, 0, 0)) at time zone 'Europe/Madrid';
    e  := (hoy + make_time(h2, 0, 0)) at time zone 'Europe/Madrid';
    if now() >= e then s := s + interval '1 day'; e := e + interval '1 day'; end if;
    if a.starts_at is distinct from s or a.ends_at is distinct from e then
      update auctions
         set starts_at = s, ends_at = e, status = 'programada', winner_id = null, final_price = null
       where id = a.id;
      update vehicles set status = 'subasta' where id = a.vehicle_id and status <> 'subasta';
      n := n + 1;
    end if;
  end loop;

  -- el estado guardado sigue al reloj
  update auctions set status = 'viva'
   where status = 'programada' and now() >= starts_at and now() < ends_at;
  return n;
end $$;

revoke execute on function public.demo_roll_auctions() from public, anon, authenticated;
