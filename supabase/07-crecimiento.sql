-- MotorSubasta · 07 · captación
-- car_leads: "Te compramos tu coche en 24 h"
-- search_alerts: búsquedas guardadas del Mercado (aviso por email)
-- Solo inserción pública (con consentimiento); lectura y gestión solo admin.

create table if not exists car_leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  make          text not null check (char_length(make) between 1 and 60),
  model         text check (char_length(model) <= 80),
  year          int  check (year between 1950 and 2100),
  km            int  check (km between 0 and 3000000),
  condition     text not null default 'sin_danos' check (condition in ('sin_danos', 'danado', 'averiado', 'siniestro')),
  city          text check (char_length(city) <= 80),
  price_wanted  numeric(10,2) check (price_wanted >= 0),
  full_name     text not null check (char_length(full_name) between 2 and 120),
  phone         text not null check (char_length(phone) between 6 and 30),
  email         text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  notes         text check (char_length(notes) <= 1000),
  lang          text not null default 'es' check (char_length(lang) <= 5),
  source        text not null default 'web' check (char_length(source) <= 60),
  consent       boolean not null check (consent),
  status        text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'oferta', 'comprado', 'descartado'))
);
alter table car_leads enable row level security;
drop policy if exists "vender coche" on car_leads;
drop policy if exists "car leads admin" on car_leads;
create policy "vender coche"    on car_leads for insert to anon, authenticated with check (consent);
create policy "car leads admin" on car_leads for all using (is_admin()) with check (is_admin());

create table if not exists search_alerts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 160),
  label       text not null check (char_length(label) <= 300),
  filters     jsonb not null default '{}'::jsonb check (pg_column_size(filters) < 4000),
  lang        text not null default 'es' check (char_length(lang) <= 5),
  active      boolean not null default true
);
alter table search_alerts enable row level security;
drop policy if exists "guardar busqueda" on search_alerts;
drop policy if exists "busquedas admin" on search_alerts;
create policy "guardar busqueda" on search_alerts for insert to anon, authenticated with check (active);
create policy "busquedas admin"  on search_alerts for all using (is_admin()) with check (is_admin());

grant insert on car_leads, search_alerts to anon, authenticated;
revoke select, update, delete on car_leads, search_alerts from anon;
grant select, update, delete on car_leads, search_alerts to authenticated;

select 'ok' as resultado, (select count(*) from car_leads) as car_leads, (select count(*) from search_alerts) as search_alerts;
