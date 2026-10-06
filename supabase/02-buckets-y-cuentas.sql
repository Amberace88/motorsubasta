-- ============================================================
-- 1) buckets de almacenamiento
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-photos','vehicle-photos', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
       ('documents','documents', false, 20971520, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects for select
  using (bucket_id = 'vehicle-photos');

drop policy if exists "subir fotos propias" on storage.objects;
create policy "subir fotos propias" on storage.objects for insert to authenticated
  with check (bucket_id = 'vehicle-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "borrar fotos propias" on storage.objects;
create policy "borrar fotos propias" on storage.objects for delete to authenticated
  using (bucket_id = 'vehicle-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documentos propios" on storage.objects;
create policy "documentos propios" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()))
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 2) cuentas de demostración
-- ============================================================
do $$
declare u record; uid uuid;
begin
  for u in
    select * from (values
      ('comprador@demo.es','Marta Ruiz','buyer','Comprador Pro','Talleres Llorca S.L.','B53122990','Alicante','+34 600 111 222'),
      ('vendedor@demo.es','Carlos Soler','seller','Vendedor Pro','Autos Finestrat S.L.','B54880123','Finestrat','+34 600 333 444'),
      ('dealer@demo.es','AutoExport Ruse','dealer','Comprador Dealer','AutoExport Ruse EOOD','BG204551221','Ruse','+359 88 123 456'),
      ('admin@motorsubasta.com','Equipo MotorSubasta','admin','Interno','MotorSubasta S.L.','B99999999','Alicante','+34 602 456 789')
    ) as t(email, nombre, rol, plan, empresa, cif, ciudad, tel)
  loop
    select id into uid from auth.users where email = u.email;
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        confirmation_token, email_change, email_change_token_new, recovery_token)
      values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        u.email, crypt('demo1234', gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', u.nombre, 'role', u.rol),
        '', '', '', '');
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
        'email', now(), now(), now());
    end if;
    update profiles set role = u.rol::user_role, full_name = u.nombre, plan = u.plan,
           company = u.empresa, cif = u.cif, city = u.ciudad, province = u.ciudad, phone = u.tel,
           verification = 'verificado', verified_at = now()
     where id = uid;
  end loop;
end $$;

select email, role, plan, verification from profiles order by role::text;
