-- Tabla de productos
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null,
  description text,
  image text,
  gallery text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Activar seguridad por fila
alter table products enable row level security;

-- Cualquiera puede ver el catalogo (publico, sin login)
create policy "Lectura publica" on products
  for select using (true);

-- Solo un usuario logueado (Johaysi) puede crear, editar o borrar
create policy "Insertar autenticados" on products
  for insert with check (auth.role() = 'authenticated');

create policy "Actualizar autenticados" on products
  for update using (auth.role() = 'authenticated');

create policy "Borrar autenticados" on products
  for delete using (auth.role() = 'authenticated');

-- Bucket de almacenamiento para las fotos de producto
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "Lectura publica imagenes" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Subir imagenes autenticados" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Borrar imagenes autenticados" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Configuración de la tienda (una sola fila, id = 1): número de WhatsApp y horario.
-- business_hours: 7 días (0 = domingo) con {closed, open "HH:MM", close "HH:MM"}, en hora de Venezuela.
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text,
  business_hours jsonb,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

create policy "Lectura publica settings" on settings
  for select using (true);

create policy "Insertar settings autenticados" on settings
  for insert with check (auth.role() = 'authenticated');

create policy "Actualizar settings autenticados" on settings
  for update using (auth.role() = 'authenticated');

insert into settings (id) values (1) on conflict (id) do nothing;
