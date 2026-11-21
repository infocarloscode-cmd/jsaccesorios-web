-- Cuentas del panel de administración con usuario y contraseña.
-- Cada usuario "maria" se guarda como "maria@usuarios.jsaccesorios.app".
-- Ejecutar una vez en Supabase → SQL Editor.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_list_users()
returns table (id uuid, username text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql security definer set search_path = public, auth
as $$
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  return query
    select u.id,
           case when u.email like '%@usuarios.jsaccesorios.app'
                then split_part(u.email::text, '@', 1) else u.email::text end,
           u.created_at, u.last_sign_in_at
    from auth.users u
    order by u.created_at;
end $$;

create or replace function public.admin_create_user(p_username text, p_password text)
returns uuid
language plpgsql security definer set search_path = public, auth, extensions
as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text;
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  p_username := lower(trim(p_username));
  if p_username !~ '^[a-z0-9._-]{3,30}$' then
    raise exception 'Usuario inválido: usa de 3 a 30 letras, números, punto, guion o guion bajo';
  end if;
  if length(p_password) < 6 then raise exception 'La contraseña debe tener al menos 6 caracteres'; end if;
  v_email := p_username || '@usuarios.jsaccesorios.app';
  if exists (select 1 from auth.users where email = v_email) then raise exception 'Ese usuario ya existe'; end if;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
          crypt(p_password, gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}', jsonb_build_object('username', p_username),
          now(), now(), '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
          'email', now(), now(), now());
  return v_id;
end $$;

create or replace function public.admin_set_password(p_id uuid, p_password text)
returns void
language plpgsql security definer set search_path = public, auth, extensions
as $$
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  if length(p_password) < 6 then raise exception 'La contraseña debe tener al menos 6 caracteres'; end if;
  update auth.users set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now()
  where id = p_id;
end $$;

create or replace function public.admin_delete_user(p_id uuid)
returns void
language plpgsql security definer set search_path = public, auth
as $$
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  if p_id = auth.uid() then raise exception 'No puedes borrar la cuenta con la que entraste'; end if;
  if (select count(*) from auth.users) <= 1 then raise exception 'Debe quedar al menos una cuenta'; end if;
  delete from auth.users where id = p_id;
end $$;

revoke all on function public.admin_list_users() from public, anon;
revoke all on function public.admin_create_user(text, text) from public, anon;
revoke all on function public.admin_set_password(uuid, text) from public, anon;
revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_create_user(text, text) to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
