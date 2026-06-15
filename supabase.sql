-- ===============================================================
-- BIJAO BURGER · Tabla de datos compartidos en Supabase
-- Pega este script en: Supabase → SQL Editor → New query → Run
-- ===============================================================

create table if not exists public.bijao_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.bijao_data enable row level security;

-- Permisos abiertos: cualquiera con la clave pública (anon) puede
-- leer y escribir. Suficiente para un demo; para producción habría
-- que validar los votos en el servidor.
create policy "demo lectura" on public.bijao_data
  for select using (true);

create policy "demo insertar" on public.bijao_data
  for insert with check (true);

create policy "demo actualizar" on public.bijao_data
  for update using (true);
