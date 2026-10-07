-- MotorSubasta · 08 · cuentas, privacidad y reglas de publicación
-- 1. Contacto del Mercado configurable por cada usuario
-- 2. Subastas anónimas: el tipo de vendedor se guarda en el vehículo (sin exponer el perfil)
-- 3. VIN obligatorio y matrícula (salvo "sin matrícula"); un vehículo activo no puede repetirse
-- 4. Un vehículo solo puede estar en un sitio: Mercado o Subasta
-- 5. Dirección de recogida privada: solo la ve el ganador cuando la compra está pagada
-- 6. Los anuncios del Mercado se publican al momento (vehículo en estado 'mercado')

/* ---------- 1. contacto ---------- */
alter table profiles add column if not exists public_name text check (char_length(public_name) <= 80);
alter table profiles add column if not exists contact_prefs jsonb not null default '{"phone": false, "whatsapp": true, "email": false, "platform": true}'::jsonb;

create or replace function listing_contact(p_listing uuid)
returns table (name text, kind text, city text, phone text, whatsapp text, email text, platform boolean)
language plpgsql stable security definer set search_path = public as $$
declare v_seller uuid; v_city text; p profiles%rowtype; prefs jsonb;
begin
  if auth.uid() is null then return; end if;
  select ve.seller_id, ve.city into v_seller, v_city
    from listings l join vehicles ve on ve.id = l.vehicle_id where l.id = p_listing and l.status = 'activo';
  if v_seller is null then return; end if;
  select * into p from profiles where id = v_seller;
  prefs := coalesce(p.contact_prefs, '{}'::jsonb);
  return query select
    coalesce(nullif(p.public_name, ''), nullif(p.company, ''), split_part(coalesce(p.full_name, ''), ' ', 1), 'Vendedor'),
    case when nullif(p.company, '') is not null then 'profesional' else 'particular' end,
    v_city,
    case when (prefs->>'phone')::boolean then p.phone end,
    case when (prefs->>'whatsapp')::boolean then coalesce(nullif(p.whatsapp, ''), p.phone) end,
    case when (prefs->>'email')::boolean then p.email end,
    coalesce((prefs->>'platform')::boolean, true);
end $$;
revoke execute on function listing_contact(uuid) from public, anon;
grant execute on function listing_contact(uuid) to authenticated;

/* nombre público del vendedor en el Mercado (sin datos de contacto) */
create or replace function listing_seller(p_listing uuid)
returns table (name text, kind text)
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(p.public_name, ''), nullif(p.company, ''), split_part(coalesce(p.full_name, ''), ' ', 1), 'Vendedor'),
         case when nullif(p.company, '') is not null then 'profesional' else 'particular' end
  from listings l join vehicles ve on ve.id = l.vehicle_id join profiles p on p.id = ve.seller_id
  where l.id = p_listing and l.status = 'activo';
$$;
grant execute on function listing_seller(uuid) to anon, authenticated;

/* ---------- 2. tipo de vendedor en el vehículo ---------- */
alter table vehicles add column if not exists seller_kind text not null default 'particular' check (seller_kind in ('particular', 'profesional'));
alter table vehicles add column if not exists no_plate boolean not null default false;
update vehicles v set seller_kind = case when nullif(p.company, '') is not null then 'profesional' else 'particular' end
  from profiles p where p.id = v.seller_id;

/* ---------- 3 y 4. reglas de publicación ---------- */
create or replace function vehicle_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare dup text;
begin
  if tg_op = 'INSERT' then
    new.seller_kind := coalesce((select case when nullif(company, '') is not null then 'profesional' else 'particular' end from profiles where id = new.seller_id), 'particular');
    if new.vin is null or char_length(regexp_replace(new.vin, '\s', '', 'g')) not between 8 and 17 then
      raise exception 'VIN_OBLIGATORIO' using errcode = '23514';
    end if;
    if (new.plate is null or char_length(trim(new.plate)) < 4) and not new.no_plate then
      raise exception 'MATRICULA_OBLIGATORIA' using errcode = '23514';
    end if;
  end if;
  if tg_op = 'INSERT' or new.vin is distinct from old.vin or new.plate is distinct from old.plate then
    new.vin := upper(regexp_replace(coalesce(new.vin, ''), '\s', '', 'g'));
    if new.vin = '' then new.vin := null; end if;
    new.plate := nullif(upper(regexp_replace(coalesce(new.plate, ''), '[\s-]', '', 'g')), '');
    select case when exists (select 1 from auctions a where a.vehicle_id = o.id and a.status in ('programada', 'viva', 'cerrada')) then 'subasta' else 'mercado' end
      into dup from vehicles o
      where o.id <> new.id and o.status not in ('vendido', 'rechazado')
        and ((new.vin is not null and o.vin = new.vin) or (new.plate is not null and upper(regexp_replace(coalesce(o.plate, ''), '[\s-]', '', 'g')) = new.plate))
      limit 1;
    if dup is not null then raise exception 'VEHICULO_YA_PUBLICADO:%', dup using errcode = '23505'; end if;
  end if;
  return new;
end $$;
drop trigger if exists vehicle_rules on vehicles;
create trigger vehicle_rules before insert or update on vehicles for each row execute function vehicle_rules();

create or replace function one_place_listing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'activo' and exists (select 1 from auctions a where a.vehicle_id = new.vehicle_id and a.status in ('programada', 'viva', 'cerrada', 'adjudicada')) then
    raise exception 'EN_SUBASTA' using errcode = '23514';
  end if;
  if new.status = 'activo' then update vehicles set status = 'mercado' where id = new.vehicle_id and status in ('borrador', 'revision', 'aprobado'); end if;
  return new;
end $$;
drop trigger if exists one_place_listing on listings;
create trigger one_place_listing before insert or update of status on listings for each row execute function one_place_listing();

create or replace function one_place_auction() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from listings l where l.vehicle_id = new.vehicle_id and l.status = 'activo') then
    raise exception 'EN_MERCADO' using errcode = '23514';
  end if;
  return new;
end $$;
drop trigger if exists one_place_auction on auctions;
create trigger one_place_auction before insert on auctions for each row execute function one_place_auction();

/* comprobación previa desde el formulario de publicar */
create or replace function vehicle_in_use(p_vin text, p_plate text)
returns text language plpgsql stable security definer set search_path = public as $$
declare v text := nullif(upper(regexp_replace(coalesce(p_vin, ''), '\s', '', 'g')), '');
        pl text := nullif(upper(regexp_replace(coalesce(p_plate, ''), '[\s-]', '', 'g')), '');
        r text;
begin
  if auth.uid() is null then return null; end if;
  select case when exists (select 1 from auctions a where a.vehicle_id = o.id and a.status in ('programada', 'viva', 'cerrada')) then 'subasta' else 'mercado' end
    into r from vehicles o
    where o.status not in ('vendido', 'rechazado')
      and ((v is not null and o.vin = v) or (pl is not null and upper(regexp_replace(coalesce(o.plate, ''), '[\s-]', '', 'g')) = pl))
    limit 1;
  return r;
end $$;
revoke execute on function vehicle_in_use(text, text) from public, anon;
grant execute on function vehicle_in_use(text, text) to authenticated;

/* anuncios ya publicados: el vehículo pasa a 'mercado' para que se vea */
update vehicles v set status = 'mercado'
  where v.status in ('borrador', 'revision', 'aprobado') and exists (select 1 from listings l where l.vehicle_id = v.id and l.status = 'activo');

/* ---------- 5. recogida privada ---------- */
create table if not exists vehicle_pickup (
  vehicle_id  uuid primary key references vehicles(id) on delete cascade,
  address     text not null check (char_length(address) between 5 and 200),
  city        text check (char_length(city) <= 80),
  hours       text check (char_length(hours) <= 120),
  phone       text check (char_length(phone) <= 30),
  notes       text check (char_length(notes) <= 500),
  updated_at  timestamptz not null default now()
);
alter table vehicle_pickup enable row level security;
drop policy if exists "recogida del vendedor" on vehicle_pickup;
create policy "recogida del vendedor" on vehicle_pickup for all
  using (is_admin() or exists (select 1 from vehicles v where v.id = vehicle_id and v.seller_id = auth.uid()))
  with check (is_admin() or exists (select 1 from vehicles v where v.id = vehicle_id and v.seller_id = auth.uid()));
revoke all on vehicle_pickup from anon;
grant select, insert, update, delete on vehicle_pickup to authenticated;

create or replace function pickup_for_order(p_order uuid)
returns table (address text, city text, hours text, phone text, notes text)
language sql stable security definer set search_path = public as $$
  select pk.address, pk.city, pk.hours, pk.phone, pk.notes
  from orders o join auctions a on a.id = o.auction_id join vehicle_pickup pk on pk.vehicle_id = a.vehicle_id
  where o.id = p_order and o.buyer_id = auth.uid() and o.status in ('pagado', 'documentacion', 'entregado');
$$;
revoke execute on function pickup_for_order(uuid) from public, anon;
grant execute on function pickup_for_order(uuid) to authenticated;

select 'ok' as resultado,
  (select count(*) from vehicles where status = 'mercado') as vehiculos_mercado,
  (select count(*) from information_schema.columns where table_name = 'profiles' and column_name in ('public_name', 'contact_prefs')) as columnas_contacto;
