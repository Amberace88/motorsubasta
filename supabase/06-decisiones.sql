-- ============================================================
-- 06 · Cierre de subasta con decisión del vendedor
-- Al cerrar: se guardan la mejor y la segunda puja, se avisa a vendedor,
-- mejor postor y resto de pujadores (aviso en la web + e-mail en cola).
-- El vendedor tiene 24 h para aceptar, rechazar o contraofertar; el
-- mejor postor responde a la contraoferta en 24 h. MotorSubasta (admin)
-- supervisa: puede decidir en lugar del vendedor y corregir el precio.
-- También: lista de espera (subastas "próximamente") y solicitudes de seguro.
-- ============================================================

alter table auctions
  add column if not exists top_bid           numeric(10,2),
  add column if not exists top_bidder        uuid references profiles(id),
  add column if not exists second_bid        numeric(10,2),
  add column if not exists second_bidder     uuid references profiles(id),
  add column if not exists decision          text check (decision in ('pendiente','aceptada','rechazada','contraoferta','caducada')),
  add column if not exists decision_deadline timestamptz,
  add column if not exists counter_price     numeric(10,2),
  add column if not exists decided_by        uuid references profiles(id),
  add column if not exists decided_at        timestamptz;
create index if not exists auctions_decision_idx on auctions (decision, decision_deadline);

/* e-mails pendientes de envío (se mandarán con el proveedor de correo cuando haya dominio) */
create table if not exists email_outbox (
  id              bigserial primary key,
  to_email        text not null,
  subject         text not null,
  body            text not null,
  related_auction uuid references auctions(id) on delete set null,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz,
  error           text
);
alter table email_outbox enable row level security;
drop policy if exists "outbox solo admin" on email_outbox;
create policy "outbox solo admin" on email_outbox for select using (is_admin());
revoke all on email_outbox from anon;

/* ---------- utilidades internas ---------- */
create or replace function ms_eur(p numeric) returns text language sql immutable as
$$ select to_char(round(p), 'FM999999990') || ' €' $$;

create or replace function notify_user(p_user uuid, p_title text, p_body text, p_icon text, p_link text, p_auction uuid)
returns void language plpgsql security definer set search_path = public as $$
declare em text;
begin
  if p_user is null then return; end if;
  insert into notifications (user_id, title, body, icon, link) values (p_user, p_title, p_body, coalesce(p_icon, 'bell'), p_link);
  select email into em from profiles where id = p_user;
  if em is not null then
    insert into email_outbox (to_email, subject, body, related_auction)
    values (em, 'MotorSubasta · ' || p_title, p_body || coalesce(E'\n\nhttps://motorsubasta.pages.dev/' || p_link, ''), p_auction);
  end if;
end $$;

create or replace function notify_admins(p_title text, p_body text, p_link text, p_auction uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select id from profiles where role = 'admin' loop
    perform notify_user(r.id, p_title, p_body, 'shield', p_link, p_auction);
  end loop;
end $$;

/* adjudicación: crea la operación y avisa a las dos partes */
create or replace function award_auction(p_auction uuid, p_price numeric, p_by uuid)
returns void language plpgsql security definer set search_path = public as $$
declare a record;
begin
  select au.*, v.seller_id, v.make, v.model into a
    from auctions au join vehicles v on v.id = au.vehicle_id where au.id = p_auction;
  update auctions set status = 'adjudicada', decision = 'aceptada', winner_id = a.top_bidder, final_price = p_price,
         decided_by = p_by, decided_at = now(), decision_deadline = null
   where id = p_auction;
  insert into orders (auction_id, buyer_id, seller_id, amount, fee)
  values (p_auction, a.top_bidder, a.seller_id, p_price, buyer_fee(p_price));
  update vehicles set status = 'vendido' where id = a.vehicle_id;
  perform notify_user(a.top_bidder, 'Compra confirmada',
    'El vendedor ha aceptado ' || ms_eur(p_price) || ' por ' || a.make || ' ' || a.model || '. Tienes 48 h para completar el pago.',
    'check', '#/pago/' || p_auction, p_auction);
  perform notify_user(a.seller_id, 'Venta confirmada',
    a.make || ' ' || a.model || ' vendido por ' || ms_eur(p_price) || '. Te avisamos cuando el comprador complete el pago.',
    'euro', '#/vender/ventas', p_auction);
end $$;

/* ---------- cierre: ya no adjudica solo, deja la decisión al vendedor ---------- */
create or replace function close_due_auctions() returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; a record; top record; sec record; r record; bajo_reserva boolean;
begin
  for a in
    select au.*, v.seller_id, v.make, v.model
      from auctions au join vehicles v on v.id = au.vehicle_id
     where au.status in ('programada', 'viva') and au.ends_at <= now()
  loop
    top := null; sec := null;
    select bidder_id, amount into top from bids where auction_id = a.id order by amount desc, created_at asc limit 1;
    if top.bidder_id is null then
      update auctions set status = 'cerrada', decision = null where id = a.id;
      perform notify_user(a.seller_id, 'Subasta cerrada sin pujas',
        a.make || ' ' || a.model || ' no ha recibido pujas. Puedes reprogramarla o publicarlo en el Mercado.',
        'clock', '#/vender/vehiculos', a.id);
    else
      select bidder_id, amount into sec from bids
       where auction_id = a.id and bidder_id <> top.bidder_id order by amount desc, created_at asc limit 1;
      update auctions set status = 'cerrada', top_bid = top.amount, top_bidder = top.bidder_id,
             second_bid = sec.amount, second_bidder = sec.bidder_id,
             decision = 'pendiente', decision_deadline = now() + interval '24 hours'
       where id = a.id;
      bajo_reserva := a.reserve_price is not null and top.amount < a.reserve_price;
      perform notify_user(a.seller_id, 'Mejor oferta: ' || ms_eur(top.amount),
        a.make || ' ' || a.model || ' ha cerrado con una mejor oferta de ' || ms_eur(top.amount) ||
        case when bajo_reserva then ' (por debajo de tu precio de reserva de ' || ms_eur(a.reserve_price) || ')' else '' end ||
        '. Tienes 24 h para aceptarla, rechazarla o hacer una contraoferta.',
        'gavel', '#/vender/decisiones', a.id);
      perform notify_user(top.bidder_id, 'Eres el mejor postor',
        'Tu puja de ' || ms_eur(top.amount) || ' es la más alta en ' || a.make || ' ' || a.model ||
        '. El vendedor decide en las próximas 24 h y te avisaremos.',
        'gavel', '#/cuenta/pujas', a.id);
      for r in select distinct bidder_id from bids where auction_id = a.id and bidder_id <> top.bidder_id loop
        perform notify_user(r.bidder_id, 'Subasta finalizada',
          'La subasta de ' || a.make || ' ' || a.model || ' ha terminado y tu puja no fue la más alta.',
          'alert', '#/subastas', a.id);
      end loop;
    end if;
    n := n + 1;
  end loop;

  -- plazos vencidos: el vendedor no decidió o el comprador no respondió a la contraoferta
  for a in
    select au.id, au.decision, au.top_bidder, v.seller_id, v.make, v.model
      from auctions au join vehicles v on v.id = au.vehicle_id
     where au.decision in ('pendiente', 'contraoferta') and au.decision_deadline <= now()
  loop
    update auctions set decision = 'caducada', decision_deadline = null where id = a.id;
    perform notify_user(a.seller_id, 'Plazo de decisión vencido',
      'Ha vencido el plazo de ' || a.make || ' ' || a.model || '. El equipo de MotorSubasta se pondrá en contacto contigo.',
      'clock', '#/vender/decisiones', a.id);
    perform notify_user(a.top_bidder, 'Plazo de decisión vencido',
      'Ha vencido el plazo de decisión de ' || a.make || ' ' || a.model || '. Te contactaremos con el resultado.',
      'clock', '#/cuenta/pujas', a.id);
    perform notify_admins('Decisión vencida', a.make || ' ' || a.model || ' (' || a.decision || ') necesita revisión.', '#/admin', a.id);
  end loop;
  return n;
end $$;

/* ---------- decisión del vendedor (o del admin) ---------- */
create or replace function decide_auction(p_auction uuid, p_action text, p_price numeric default null)
returns table (ok boolean, message text)
language plpgsql security definer set search_path = public as $$
declare a record; uid uuid := auth.uid(); adm boolean := is_admin();
begin
  select au.*, v.seller_id, v.make, v.model into a
    from auctions au join vehicles v on v.id = au.vehicle_id where au.id = p_auction for update of au;
  if not found then return query select false, 'Subasta no encontrada'; return; end if;
  if not (adm or a.seller_id = uid) then return query select false, 'No autorizado'; return; end if;
  if not (a.decision = 'pendiente' or (adm and a.decision in ('contraoferta', 'caducada'))) then
    return query select false, 'Esta subasta no está pendiente de decisión'; return; end if;

  if p_action = 'aceptar' then
    perform award_auction(a.id, case when adm and p_price is not null then p_price else a.top_bid end, uid);
    return query select true, 'Oferta aceptada'; return;
  elsif p_action = 'rechazar' then
    update auctions set decision = 'rechazada', decided_by = uid, decided_at = now(), decision_deadline = null where id = a.id;
    perform notify_user(a.top_bidder, 'Oferta no aceptada',
      'El vendedor no ha aceptado tu oferta de ' || ms_eur(a.top_bid) || ' por ' || a.make || ' ' || a.model || '.',
      'x', '#/cuenta/pujas', a.id);
    return query select true, 'Oferta rechazada'; return;
  elsif p_action = 'contraoferta' then
    if p_price is null or p_price <= a.top_bid then
      return query select false, 'La contraoferta debe ser mayor que la mejor puja'; return; end if;
    update auctions set decision = 'contraoferta', counter_price = p_price, decision_deadline = now() + interval '24 hours',
           decided_by = uid, decided_at = now() where id = a.id;
    perform notify_user(a.top_bidder, 'Contraoferta del vendedor',
      'El vendedor propone ' || ms_eur(p_price) || ' por ' || a.make || ' ' || a.model || ' (tu puja: ' || ms_eur(a.top_bid) ||
      '). Acéptala o recházala en 24 h.', 'msg', '#/cuenta/pujas', a.id);
    return query select true, 'Contraoferta enviada'; return;
  end if;
  return query select false, 'Acción no válida';
end $$;

/* ---------- respuesta del mejor postor a la contraoferta ---------- */
create or replace function respond_counter(p_auction uuid, p_accept boolean)
returns table (ok boolean, message text)
language plpgsql security definer set search_path = public as $$
declare a record; uid uuid := auth.uid();
begin
  select au.*, v.seller_id, v.make, v.model into a
    from auctions au join vehicles v on v.id = au.vehicle_id where au.id = p_auction for update of au;
  if not found then return query select false, 'Subasta no encontrada'; return; end if;
  if a.top_bidder is distinct from uid then return query select false, 'No autorizado'; return; end if;
  if a.decision <> 'contraoferta' or a.decision_deadline <= now() then
    return query select false, 'La contraoferta ya no está vigente'; return; end if;
  if p_accept then
    perform award_auction(a.id, a.counter_price, uid);
    return query select true, 'Contraoferta aceptada'; return;
  end if;
  update auctions set decision = 'rechazada', decided_at = now(), decision_deadline = null where id = a.id;
  perform notify_user(a.seller_id, 'Contraoferta rechazada',
    'El comprador no ha aceptado tu contraoferta de ' || ms_eur(a.counter_price) || ' por ' || a.make || ' ' || a.model || '.',
    'x', '#/vender/decisiones', a.id);
  return query select true, 'Contraoferta rechazada'; return;
end $$;

/* ---------- lista de espera y solicitudes de seguro ---------- */
create table if not exists waitlist (
  id         bigserial primary key,
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 200),
  topic      text not null default 'subastas' check (topic in ('subastas', 'seguros')),
  lang       text,
  created_at timestamptz not null default now(),
  unique (email, topic)
);
alter table waitlist enable row level security;
drop policy if exists "apuntarse" on waitlist;
drop policy if exists "waitlist admin" on waitlist;
create policy "apuntarse"      on waitlist for insert to anon, authenticated with check (true);
create policy "waitlist admin" on waitlist for select using (is_admin());

create table if not exists insurance_leads (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('dias', 'anual', 'profesional', 'transporte')),
  plate         text check (length(plate) <= 15),
  make          text check (length(make) <= 60),
  model         text check (length(model) <= 80),
  year          int  check (year between 1950 and 2100),
  use_type      text check (length(use_type) <= 40),
  start_date    date,
  days          int  check (days between 1 and 365),
  birth_year    int  check (birth_year between 1920 and 2010),
  license_years int  check (license_years between 0 and 80),
  postal_code   text check (postal_code ~ '^\d{5}$'),
  full_name     text not null check (length(full_name) between 2 and 120),
  phone         text not null check (length(phone) between 6 and 30),
  email         text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 200),
  notes         text check (length(notes) <= 1000),
  lang          text,
  source        text,
  consent       boolean not null check (consent),
  status        text not null default 'nuevo' check (status in ('nuevo', 'enviado', 'contactado', 'cerrado', 'descartado')),
  user_id       uuid default auth.uid(),
  created_at    timestamptz not null default now()
);
alter table insurance_leads enable row level security;
drop policy if exists "pedir seguro" on insurance_leads;
drop policy if exists "seguros admin" on insurance_leads;
create policy "pedir seguro"  on insurance_leads for insert to anon, authenticated with check (consent);
create policy "seguros admin" on insurance_leads for all using (is_admin()) with check (is_admin());

grant insert on waitlist, insurance_leads to anon, authenticated;
grant usage, select on sequence waitlist_id_seq to anon, authenticated;
revoke select on waitlist, insurance_leads, email_outbox from anon;

/* lo interno no se puede llamar desde la web; las decisiones solo con sesión iniciada */
revoke execute on function notify_user(uuid, text, text, text, text, uuid) from public, anon, authenticated;
revoke execute on function notify_admins(text, text, text, uuid)          from public, anon, authenticated;
revoke execute on function award_auction(uuid, numeric, uuid)              from public, anon, authenticated;
revoke execute on function close_due_auctions()                            from public, anon, authenticated;
revoke execute on function decide_auction(uuid, text, numeric)             from public, anon;
revoke execute on function respond_counter(uuid, boolean)                  from public, anon;
grant  execute on function decide_auction(uuid, text, numeric)             to authenticated;
grant  execute on function respond_counter(uuid, boolean)                  to authenticated;
