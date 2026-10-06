-- ============================================================
-- MotorSubasta — esquema completo (PostgreSQL / Supabase)
-- Aplicar en un proyecto nuevo:  supabase db push   (o pegar en el SQL editor)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- tipos ----------
create type user_role        as enum ('buyer','seller','dealer','admin');
create type vehicle_category as enum ('limpio','danado','siniestro','oculta');
create type title_status     as enum ('limpio','salvamento','piezas');
create type vehicle_status   as enum ('borrador','revision','aprobado','subasta','mercado','vendido','rechazado');
create type auction_status   as enum ('programada','viva','cerrada','adjudicada','cancelada');
create type offer_status     as enum ('nueva','aceptada','rechazada','contraoferta','caducada');
create type order_status     as enum ('pendiente_pago','pagado','documentacion','entregado','incumplido');
create type invoice_status   as enum ('pendiente','pagada','vencida');
create type verif_status     as enum ('pendiente','enviado','revision','verificado','rechazado');

-- ---------- perfiles ----------
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  role          user_role not null default 'buyer',
  full_name     text,
  email         text unique,
  phone         text,
  whatsapp      text,
  company       text,
  company_type  text,
  cif           text,
  address       text,
  city          text,
  province      text,
  postal_code   text,
  country       text default 'ES',
  plan          text default 'Comprador Gratis',
  verification  verif_status not null default 'pendiente',
  verified_at   timestamptz,
  blocked       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- perfil automático al registrarse
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'buyer'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function is_verified() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and verification = 'verificado' and not blocked);
$$;

-- puntuacion de condicion 0-100 a partir del mapa de paneles
create or replace function vehicle_condition_score(p jsonb) returns int
language sql immutable as $$
  select 100 - least(100, coalesce((
    select sum(case value::int when 1 then 1 when 2 then 3 when 3 then 6 when 4 then 10 else 0 end)
    from jsonb_each_text(p)), 0))::int;
$$;

-- ---------- vehiculos ----------
create table vehicles (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique default ('MS-' || lpad((floor(random()*99999))::text, 5, '0')),
  seller_id     uuid not null references profiles(id) on delete cascade,
  make          text not null,
  model         text not null,
  year          int  not null check (year between 1950 and extract(year from now())::int + 1),
  km            int  not null check (km >= 0),
  fuel          text,
  transmission  text,
  body_type     text,
  power_cv      int,
  displacement  int,
  seats         int,
  vin           text,
  plate         text,
  first_reg     date,
  category      vehicle_category not null default 'limpio',
  title         title_status     not null default 'limpio',
  panels        jsonb not null default '{}'::jsonb,   -- {"pdel":3,"capo":2,...}
  condition_score int generated always as (vehicle_condition_score(panels)) stored,
  runs          boolean default true,
  has_keys      boolean default true,
  description   text,
  photos        text[] not null default '{}',
  city          text,
  province      text,
  status        vehicle_status not null default 'borrador',
  created_at    timestamptz not null default now()
);
create index on vehicles (seller_id);
create index on vehicles (status, category);

-- ---------- subastas ----------
create table auctions (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references vehicles(id) on delete cascade,
  session       vehicle_category not null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  start_price   numeric(10,2) not null check (start_price >= 0),
  reserve_price numeric(10,2),
  buy_now_price numeric(10,2),
  featured      boolean not null default false,
  status        auction_status not null default 'programada',
  winner_id     uuid references profiles(id),
  final_price   numeric(10,2),
  views         int not null default 0,
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index on auctions (status, starts_at);
create index on auctions (session, starts_at);

create table bids (
  id          bigserial primary key,
  auction_id  uuid not null references auctions(id) on delete cascade,
  bidder_id   uuid not null references profiles(id) on delete cascade,
  amount      numeric(10,2) not null check (amount > 0),
  is_pre      boolean not null default false,
  is_auto     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on bids (auction_id, amount desc);

create table autobids (
  auction_id  uuid not null references auctions(id) on delete cascade,
  bidder_id   uuid not null references profiles(id) on delete cascade,
  max_amount  numeric(10,2) not null check (max_amount > 0),
  created_at  timestamptz not null default now(),
  primary key (auction_id, bidder_id)
);

create table watchlist (
  user_id    uuid not null references profiles(id) on delete cascade,
  auction_id uuid not null references auctions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, auction_id)
);

-- precio actual y nº de pujas
create or replace view auction_state as
select a.id,
       coalesce(max(b.amount), a.start_price) as current_price,
       count(b.id)                            as bid_count,
       count(distinct b.bidder_id)            as bidder_count
from auctions a left join bids b on b.auction_id = a.id
group by a.id, a.start_price;

-- incremento mínimo por tramo
create or replace function bid_increment(p numeric) returns numeric
language sql immutable as $$
  select case when p < 1000 then 25 when p < 5000 then 50 when p < 15000 then 100 else 250 end;
$$;

-- ---------- puja con anti-sniping y puja automática ----------
create or replace function place_bid(p_auction uuid, p_amount numeric)
returns table (ok boolean, message text, new_price numeric)
language plpgsql security definer set search_path = public as $$
declare
  a auctions%rowtype; cur numeric; minimum numeric; rival record;
begin
  if not is_verified() then return query select false, 'Cuenta no verificada', null::numeric; return; end if;
  select * into a from auctions where id = p_auction for update;
  if not found then return query select false, 'Subasta no encontrada', null::numeric; return; end if;
  if a.status in ('cerrada','adjudicada','cancelada') or now() > a.ends_at then
    return query select false, 'La subasta ya ha cerrado', null::numeric; return; end if;

  select coalesce(max(amount), a.start_price) into cur from bids where auction_id = a.id;
  minimum := case when exists (select 1 from bids where auction_id = a.id)
                  then cur + bid_increment(cur) else a.start_price end;
  if p_amount < minimum then
    return query select false, 'La puja mínima es ' || minimum::text, cur; return; end if;

  insert into bids (auction_id, bidder_id, amount, is_pre)
  values (a.id, auth.uid(), p_amount, now() < a.starts_at);

  -- anti-sniping: ampliar 2 minutos
  if now() between a.starts_at and a.ends_at and a.ends_at - now() < interval '2 minutes' then
    update auctions set ends_at = now() + interval '2 minutes' where id = a.id;
  end if;

  -- puja automática de otros compradores
  select * into rival from autobids
    where auction_id = a.id and bidder_id <> auth.uid() and max_amount >= p_amount + bid_increment(p_amount)
    order by max_amount desc, created_at asc limit 1;
  if found then
    insert into bids (auction_id, bidder_id, amount, is_auto)
    values (a.id, rival.bidder_id, least(rival.max_amount, p_amount + bid_increment(p_amount)), true);
  end if;

  select coalesce(max(amount), a.start_price) into cur from bids where auction_id = a.id;
  return query select true, 'Puja registrada', cur;
end $$;

-- cierre de subastas (llamar desde un cron de Supabase cada minuto)
create or replace function close_due_auctions() returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; a record; top record;
begin
  for a in select * from auctions where status in ('programada','viva') and ends_at <= now() loop
    select bidder_id, amount into top from bids where auction_id = a.id order by amount desc, created_at asc limit 1;
    if top.bidder_id is not null and (a.reserve_price is null or top.amount >= a.reserve_price) then
      update auctions set status = 'adjudicada', winner_id = top.bidder_id, final_price = top.amount where id = a.id;
      insert into orders (auction_id, buyer_id, seller_id, amount, fee)
        select a.id, top.bidder_id, v.seller_id, top.amount, buyer_fee(top.amount)
        from vehicles v where v.id = a.vehicle_id;
      update vehicles set status = 'vendido' where id = a.vehicle_id;
      -- avisos al comprador, al vendedor y a los pujadores superados
      insert into notifications (user_id, title, body, icon, link)
        select top.bidder_id, 'Has ganado la subasta',
               'Lote ' || v.make || ' ' || v.model || ' adjudicado por ' || top.amount ||
               ' €. Tienes 48 h para completar el pago.', 'gavel', '#/pago/' || a.id
        from vehicles v where v.id = a.vehicle_id;
      insert into notifications (user_id, title, body, icon, link)
        select v.seller_id, 'Tu vehículo se ha vendido',
               v.make || ' ' || v.model || ' adjudicado por ' || top.amount ||
               ' €. Te avisamos cuando el comprador complete el pago.', 'euro', '#/vender/ventas'
        from vehicles v where v.id = a.vehicle_id;
      insert into notifications (user_id, title, body, icon, link)
        select distinct b.bidder_id, 'Subasta finalizada',
               'El lote por el que pujabas se ha adjudicado en ' || top.amount || ' €.', 'alert', '#/subastas'
        from bids b where b.auction_id = a.id and b.bidder_id <> top.bidder_id;
    else
      update auctions set status = 'cerrada' where id = a.id;
      insert into notifications (user_id, title, body, icon, link)
        select v.seller_id, 'Subasta cerrada sin adjudicar',
               v.make || ' ' || v.model || ' no alcanzó el precio de reserva. Puedes reprogramarla.', 'clock', '#/vender/vehiculos'
        from vehicles v where v.id = a.vehicle_id;
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------- mercado ----------
create table listings (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references vehicles(id) on delete cascade,
  price       numeric(10,2) not null,
  negotiable  boolean not null default true,
  listing_type text not null default 'Vehículos ligeros',
  status      text not null default 'activo',
  created_at  timestamptz not null default now()
);
create table offers (
  id          bigserial primary key,
  listing_id  uuid not null references listings(id) on delete cascade,
  buyer_id    uuid not null references profiles(id) on delete cascade,
  amount      numeric(10,2) not null,
  message     text,
  status      offer_status not null default 'nueva',
  counter     numeric(10,2),
  created_at  timestamptz not null default now()
);

-- ---------- operaciones, tarifas y facturas ----------
create table fee_tiers (
  id serial primary key, min_price numeric, max_price numeric, fee numeric, percent numeric
);
insert into fee_tiers (min_price, max_price, fee, percent) values
  (0,499,39,null),(500,999,79,null),(1000,1999,139,null),(2000,3999,219,null),(4000,5999,279,null),
  (6000,7999,319,null),(8000,9999,359,null),(10000,12999,399,null),(13000,15999,459,null),(16000,null,null,2.8);

create or replace function buyer_fee(p numeric) returns numeric
language sql stable as $$
  select coalesce(
    (select case when t.percent is null then t.fee else round(p * t.percent / 100, 2) end
     from fee_tiers t where p >= t.min_price and (t.max_price is null or p <= t.max_price) limit 1), 0);
$$;

create table orders (
  id          uuid primary key default gen_random_uuid(),
  auction_id  uuid references auctions(id) on delete set null,
  listing_id  uuid references listings(id) on delete set null,
  buyer_id    uuid not null references profiles(id),
  seller_id   uuid not null references profiles(id),
  amount      numeric(10,2) not null,
  fee         numeric(10,2) not null default 0,
  transport   numeric(10,2) default 0,
  gestoria    numeric(10,2) default 0,
  status      order_status not null default 'pendiente_pago',
  doc_status  text default 'pendiente',
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
create table invoices (
  id          uuid primary key default gen_random_uuid(),
  number      text unique not null,
  user_id     uuid not null references profiles(id) on delete cascade,
  order_id    uuid references orders(id) on delete set null,
  concept     text not null,
  base        numeric(10,2) not null,
  vat         numeric(10,2) not null default 0,
  total       numeric(10,2) generated always as (base + vat) stored,
  status      invoice_status not null default 'pendiente',
  issued_at   date not null default current_date
);
create table payouts (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references profiles(id) on delete cascade,
  order_id    uuid references orders(id) on delete set null,
  amount      numeric(10,2) not null,
  status      text not null default 'programada',
  paid_at     timestamptz
);
create table subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  plan        text not null,
  interval    text not null default 'mensual',
  price       numeric(10,2) not null,
  status      text not null default 'activa',
  renews_at   date,
  created_at  timestamptz not null default now()
);

-- ---------- comunicación ----------
create table notifications (
  id          bigserial primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text,
  body        text not null,
  icon        text default 'bell',
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create table contact_messages (
  id          bigserial primary key,
  name        text, email text, phone text, subject text, body text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);
create table valuations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  make text, model text, year int, km int, vin text, plate text,
  damage_type text, title title_status, has_keys boolean, runs boolean,
  description text, photos text[] default '{}',
  direct_offer boolean default false,
  offer_amount numeric(10,2),
  status      text not null default 'nueva',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table profiles          enable row level security;
alter table vehicles          enable row level security;
alter table auctions          enable row level security;
alter table bids              enable row level security;
alter table autobids          enable row level security;
alter table watchlist         enable row level security;
alter table listings          enable row level security;
alter table offers            enable row level security;
alter table orders            enable row level security;
alter table invoices          enable row level security;
alter table payouts           enable row level security;
alter table subscriptions     enable row level security;
alter table notifications     enable row level security;
alter table contact_messages  enable row level security;
alter table valuations        enable row level security;
alter table fee_tiers         enable row level security;

-- perfiles: cada uno el suyo; admin todo
create policy "perfil propio"        on profiles for select using (id = auth.uid() or is_admin());
create policy "editar perfil propio" on profiles for update using (id = auth.uid() or is_admin());

-- vehículos: públicos los aprobados; el vendedor gestiona los suyos
create policy "vehiculos publicos"   on vehicles for select using (status in ('subasta','mercado','vendido') or seller_id = auth.uid() or is_admin());
create policy "vendedor crea"        on vehicles for insert with check (seller_id = auth.uid() and is_verified());
create policy "vendedor edita"       on vehicles for update using (seller_id = auth.uid() or is_admin());
create policy "vendedor borra"       on vehicles for delete using (seller_id = auth.uid() or is_admin());

-- subastas: lectura pública; escritura solo admin
create policy "subastas publicas"    on auctions for select using (true);
create policy "admin gestiona"       on auctions for all using (is_admin()) with check (is_admin());

-- pujas: lectura pública (historial), inserción solo vía place_bid
create policy "pujas visibles"       on bids for select using (true);
create policy "sin insercion directa" on bids for insert with check (false);

create policy "autobid propio"       on autobids for all using (bidder_id = auth.uid()) with check (bidder_id = auth.uid() and is_verified());
create policy "watchlist propia"     on watchlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "anuncios publicos"    on listings for select using (status = 'activo' or is_admin()
  or exists (select 1 from vehicles v where v.id = vehicle_id and v.seller_id = auth.uid()));
create policy "anuncio del vendedor" on listings for all using (
  exists (select 1 from vehicles v where v.id = vehicle_id and v.seller_id = auth.uid()) or is_admin());

create policy "ofertas visibles"     on offers for select using (
  buyer_id = auth.uid() or is_admin()
  or exists (select 1 from listings l join vehicles v on v.id = l.vehicle_id where l.id = listing_id and v.seller_id = auth.uid()));
create policy "comprador oferta"     on offers for insert with check (buyer_id = auth.uid() and is_verified());
create policy "vendedor responde"    on offers for update using (
  is_admin() or exists (select 1 from listings l join vehicles v on v.id = l.vehicle_id where l.id = listing_id and v.seller_id = auth.uid()));

create policy "operaciones propias"  on orders        for select using (buyer_id = auth.uid() or seller_id = auth.uid() or is_admin());
create policy "facturas propias"     on invoices      for select using (user_id = auth.uid() or is_admin());
create policy "liquidaciones propias" on payouts      for select using (seller_id = auth.uid() or is_admin());
create policy "suscripcion propia"   on subscriptions for select using (user_id = auth.uid() or is_admin());
create policy "notificaciones propias" on notifications for all using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());
create policy "valoracion propia"    on valuations    for select using (user_id = auth.uid() or is_admin());
create policy "crear valoracion"     on valuations    for insert with check (true);
create policy "contacto abierto"     on contact_messages for insert with check (true);
create policy "contacto admin"       on contact_messages for select using (is_admin());
create policy "tarifas publicas"     on fee_tiers     for select using (true);

-- ============================================================
-- Realtime: el front se suscribe a las pujas de la subasta abierta
-- ============================================================
alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table auctions;

-- ============================================================
-- Storage (crear desde el panel):
--   bucket "vehicle-photos"  público de lectura, escritura solo del vendedor dueño
--   bucket "documents"       privado (permisos, fichas técnicas, informes DGT)
-- ============================================================
