-- ============================================================
-- FAMÍLIA SAUDÁVEL — banco de dados (Supabase)
-- Cole tudo no SQL Editor do Supabase e clique em "Run".
-- ============================================================

create table if not exists public.registros (
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chave text not null,
  valor jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (owner, chave)
);

-- Segurança: cada login só enxerga e altera os próprios registros.
-- NÃO desative o RLS desta tabela: ela guarda dados de saúde da família.
alter table public.registros enable row level security;

drop policy if exists "ler os proprios" on public.registros;
drop policy if exists "inserir os proprios" on public.registros;
drop policy if exists "alterar os proprios" on public.registros;
drop policy if exists "apagar os proprios" on public.registros;

create policy "ler os proprios" on public.registros
  for select to authenticated using (owner = auth.uid());
create policy "inserir os proprios" on public.registros
  for insert to authenticated with check (owner = auth.uid());
create policy "alterar os proprios" on public.registros
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "apagar os proprios" on public.registros
  for delete to authenticated using (owner = auth.uid());

-- ============================================================
-- FOTOS DAS PROVAS (Storage privado)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('fotos-familia', 'fotos-familia', false)
on conflict (id) do nothing;

drop policy if exists "fotos: ver as proprias" on storage.objects;
drop policy if exists "fotos: enviar as proprias" on storage.objects;
drop policy if exists "fotos: alterar as proprias" on storage.objects;
drop policy if exists "fotos: apagar as proprias" on storage.objects;

create policy "fotos: ver as proprias" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos-familia' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos: enviar as proprias" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-familia' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos: alterar as proprias" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-familia' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos: apagar as proprias" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-familia' and (storage.foldername(name))[1] = auth.uid()::text);
