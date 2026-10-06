-- ============================================================
-- inventario de demostracion
-- ============================================================
delete from bids; delete from autobids; delete from watchlist; delete from orders; delete from offers; delete from listings; delete from auctions; delete from vehicles;

do $$
declare s uuid; v uuid; a uuid; t timestamptz := date_trunc('day', now());
begin
  select id into s from profiles where email = 'vendedor@demo.es';

  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Opel', 'Corsa 1.2', 2003, 129000, 'Gasolina', 'Manual', 'Compacto', 75, 'limpio', '{"capo":1,"techo":1}'::jsonb, true, true,
          array['img/opel-corsa-verde.jpg'], 'Murcia', 'Murcia', 'aprobado', 'WVW10000000ZZZ123', '1000 BCD')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'limpio', t + interval '0 days' + interval '11:00', t + interval '0 days' + interval '11:00' + interval '2 hours', 400, null, true, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Renault', 'Clio V 1.0 TCe', 2019, 88400, 'Gasolina', 'Manual', 'Compacto', 90, 'limpio', '{"pdel":1}'::jsonb, true, true,
          array['img/renault-clio.jpg'], 'Bilbao', 'Bizkaia', 'aprobado', 'WVW10000073ZZZ123', '1137 FGH')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'limpio', t + interval '1 days' + interval '11:00', t + interval '1 days' + interval '11:00' + interval '2 hours', 1550, 9800, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Opel', 'Astra 1.7 CDTi', 2009, 232388, 'Diésel', 'Manual', 'Compacto', 110, 'limpio', '{"pdi":1,"int":1}'::jsonb, true, true,
          array['img/opel-astra.jpg'], 'El Campello', 'Alicante', 'aprobado', 'WVW10000146ZZZ123', '1274 JKL')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'limpio', t + interval '2 days' + interval '11:00', t + interval '2 days' + interval '11:00' + interval '2 hours', 975, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Renault', 'Trafic 1.9 dCi 9 plazas', 2005, 481000, 'Diésel', 'Manual', 'Furgoneta', 100, 'limpio', '{"pdel":2,"add":1}'::jsonb, true, true,
          array['img/renault-traffic.jpg'], 'Sevilla', 'Sevilla', 'aprobado', 'WVW10000219ZZZ123', '1411 MNP')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'limpio', t + interval '0 days' + interval '11:00', t + interval '0 days' + interval '11:00' + interval '2 hours', 1375, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'BMW', '330Ci Cabrio', 2005, 329000, 'Gasolina', 'Manual', 'Descapotable', 231, 'limpio', '{}'::jsonb, true, true,
          array['img/bmw-330ci.jpg'], 'El Prat', 'Barcelona', 'aprobado', 'WVW10000292ZZZ123', '1548 RST')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'limpio', t + interval '1 days' + interval '11:00', t + interval '1 days' + interval '11:00' + interval '2 hours', 825, 4200, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Honda', 'Civic 1.0 VTEC', 2019, 98500, 'Gasolina', 'Manual', 'Compacto', 129, 'limpio', '{}'::jsonb, true, true,
          array['img/honda-civic.jpg'], 'Valencia', 'Valencia', 'aprobado', 'WVW10000365ZZZ123', '1685 BCD')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'limpio', t + interval '2 days' + interval '11:00', t + interval '2 days' + interval '11:00' + interval '2 hours', 2250, null, true, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Toyota', 'Yaris Hybrid', 2015, 129050, 'Híbrido', 'Automático', 'Compacto', 100, 'danado', '{"pdel":3,"add":3,"capo":2}'::jsonb, true, true,
          array['img/toyota-yaris.jpg'], 'Zaragoza', 'Zaragoza', 'aprobado', 'WVW10000438ZZZ123', '1822 FGH')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'danado', t + interval '0 days' + interval '13:00', t + interval '0 days' + interval '13:00' + interval '2 hours', 1750, null, true, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Mercedes-Benz', 'S 350 d', 2018, 178000, 'Diésel', 'Automático', 'Berlina', 286, 'danado', '{"pdel":4,"adi":4,"capo":3,"pdi":2}'::jsonb, true, true,
          array['img/mercedes-s.jpg'], 'Finestrat', 'Alicante', 'aprobado', 'WVW10000511ZZZ123', '1959 JKL')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'danado', t + interval '1 days' + interval '13:00', t + interval '1 days' + interval '13:00' + interval '2 hours', 2000, 25000, true, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'BMW', '325xi Touring', 2016, 222000, 'Diésel', 'Automático', 'Familiar', 218, 'danado', '{"pdel":4,"capo":4,"adi":3,"techo":2,"mec":3}'::jsonb, false, true,
          array['img/bmw-325xi.jpg'], 'Hospitalet', 'Barcelona', 'aprobado', 'WVW10000584ZZZ123', '2096 MNP')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'danado', t + interval '2 days' + interval '13:00', t + interval '2 days' + interval '13:00' + interval '2 hours', 1750, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Ford', 'Transit 2.2 TDCi', 2014, 464000, 'Diésel', 'Manual', 'Furgoneta', 125, 'danado', '{"pdel":3,"add":4,"pdd":3}'::jsonb, true, true,
          array['img/ford-transit.jpg'], 'Torremolinos', 'Málaga', 'aprobado', 'WVW10000657ZZZ123', '2233 RST')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'danado', t + interval '0 days' + interval '13:00', t + interval '0 days' + interval '13:00' + interval '2 hours', 818, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Peugeot', '307 1.6 HDi', 2006, 191000, 'Diésel', 'Manual', 'Compacto', 110, 'danado', '{"techo":4,"pdi":4,"capo":2,"adi":3}'::jsonb, false, false,
          array['img/peugeot-307.jpg'], 'Granada', 'Granada', 'aprobado', 'WVW10000730ZZZ123', '2370 BCD')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'danado', t + interval '1 days' + interval '13:00', t + interval '1 days' + interval '13:00' + interval '2 hours', 425, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Suzuki', 'Jimny 1.3 4x4', 2011, 238000, 'Gasolina', 'Manual', 'Todoterreno', 85, 'danado', '{"techo":4,"pdi":3,"pdel":3,"capo":3}'::jsonb, true, true,
          array['img/suzuki-jimny.jpg'], 'Córdoba', 'Córdoba', 'aprobado', 'WVW10000803ZZZ123', '2507 FGH')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'danado', t + interval '2 days' + interval '13:00', t + interval '2 days' + interval '13:00' + interval '2 hours', 625, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'Mercedes-Benz', 'E 220 Cabrio', 2015, 189000, 'Diésel', 'Automático', 'Descapotable', 170, 'siniestro', '{"pdel":4,"capo":4,"techo":4,"int":4,"mec":4,"pdi":4,"pdd":4}'::jsonb, false, false,
          array['img/mercedes-e-quemado.jpg'], 'Isla de Palma', 'Illes Balears', 'aprobado', 'WVW10000876ZZZ123', '2644 JKL')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'siniestro', t + interval '0 days' + interval '16:00', t + interval '0 days' + interval '16:00' + interval '2 hours', 2250, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'SEAT', 'Ibiza 1.0 TSI', 2016, 89000, 'Gasolina', 'Manual', 'Compacto', 95, 'siniestro', '{"int":4,"mec":4,"pdel":3,"capo":2}'::jsonb, false, true,
          array['img/seat-ibiza.jpg'], 'Paterna', 'Valencia', 'aprobado', 'WVW10000949ZZZ123', '2781 MNP')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'siniestro', t + interval '1 days' + interval '16:00', t + interval '1 days' + interval '16:00' + interval '2 hours', 325, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'BMW', '320i E36', 1993, 235000, 'Gasolina', 'Manual', 'Berlina', 150, 'siniestro', '{"pdel":4,"capo":4,"techo":4,"male":4,"int":4,"mec":4}'::jsonb, false, false,
          array['img/bmw-320i.jpg'], 'Paterna', 'Valencia', 'aprobado', 'WVW10001022ZZZ123', '2918 RST')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'siniestro', t + interval '2 days' + interval '16:00', t + interval '2 days' + interval '16:00' + interval '2 hours', 75, null, false, 'programada')
  returning id into a;
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, body_type, power_cv, category, panels, runs, has_keys, photos, city, province, status, vin, plate)
  values (s, 'BMW', 'M3 E30', 1988, 88000, 'Gasolina', 'Manual', 'Coupé', 200, 'oculta', '{"pdel":1}'::jsonb, true, true,
          array['img/bmw-m3.jpg'], 'Calpe', 'Alicante', 'aprobado', 'WVW10001095ZZZ123', '3055 BCD')
  returning id into v;
  insert into auctions (vehicle_id, session, starts_at, ends_at, start_price, buy_now_price, featured, status)
  values (v, 'oculta', t + interval '0 days' + interval '18:00', t + interval '0 days' + interval '18:00' + interval '2 hours', 16250, null, true, 'programada')
  returning id into a;
end $$;

-- la primera sesion del dia ya esta viva
update auctions set starts_at = now() - interval '20 minutes', ends_at = now() + interval '100 minutes', status = 'viva'
 where id in (select id from auctions order by starts_at limit 4);

select count(*) as vehiculos from vehicles;
select status, count(*) from auctions group by status;

-- ---------- mercado ----------
do $$
declare s uuid; v uuid;
begin
  select id into s from profiles where email = 'vendedor@demo.es';

  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, category, photos, city, province, status, vin)
  values (s, 'Honda', 'CBR600RR', 2011, 89655, 'Gasolina', 'Manual', 'danado', array['img/honda-cbr.jpg'], 'Calpe', 'Calpe', 'mercado', 'VF120000000XY7')
  returning id into v;
  insert into listings (vehicle_id, price, negotiable, listing_type, status, created_at)
  values (v, 3900, true, 'Motocicletas', 'activo', now() - interval '4 days');
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, category, photos, city, province, status, vin)
  values (s, 'DAF', 'CF 85.460', 2017, 560900, 'Diésel', 'Automático', 'danado', array['img/daf-cf.jpg'], 'Elche', 'Elche', 'mercado', 'VF120000091XY7')
  returning id into v;
  insert into listings (vehicle_id, price, negotiable, listing_type, status, created_at)
  values (v, 18500, true, 'Transporte pesado', 'activo', now() - interval '9 days');
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, category, photos, city, province, status, vin)
  values (s, 'Honda', 'Civic 1.0 VTEC', 2019, 98500, 'Gasolina', 'Manual', 'danado', array['img/honda-civic.jpg'], 'Madrid', 'Madrid', 'mercado', 'VF120000182XY7')
  returning id into v;
  insert into listings (vehicle_id, price, negotiable, listing_type, status, created_at)
  values (v, 5600, false, 'Vehículos ligeros', 'activo', now() - interval '2 days');
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, category, photos, city, province, status, vin)
  values (s, 'Opel', 'Astra 1.7 CDTi', 2009, 232388, 'Diésel', 'Manual', 'limpio', array['img/opel-astra.jpg'], 'El Campello', 'El Campello', 'mercado', 'VF120000273XY7')
  returning id into v;
  insert into listings (vehicle_id, price, negotiable, listing_type, status, created_at)
  values (v, 3900, true, 'Vehículos ligeros', 'activo', now() - interval '12 days');
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, category, photos, city, province, status, vin)
  values (s, 'Renault', 'Clio V TCe 90', 2019, 88400, 'Gasolina', 'Manual', 'limpio', array['img/renault-clio.jpg'], 'Bilbao', 'Bilbao', 'mercado', 'VF120000364XY7')
  returning id into v;
  insert into listings (vehicle_id, price, negotiable, listing_type, status, created_at)
  values (v, 9800, true, 'Vehículos ligeros', 'activo', now() - interval '1 days');
  insert into vehicles (seller_id, make, model, year, km, fuel, transmission, category, photos, city, province, status, vin)
  values (s, 'Renault', 'Trafic Combi 9', 2005, 481000, 'Diésel', 'Manual', 'limpio', array['img/renault-traffic.jpg'], 'Sevilla', 'Sevilla', 'mercado', 'VF120000455XY7')
  returning id into v;
  insert into listings (vehicle_id, price, negotiable, listing_type, status, created_at)
  values (v, 4500, false, 'Vehículos ligeros', 'activo', now() - interval '6 days');
end $$;
select count(*) as anuncios from listings;
