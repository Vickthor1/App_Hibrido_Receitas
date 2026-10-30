-- Migração Supabase — Fase 4: Sistema de Seguidores
-- Cole este bloco SQL no Supabase Dashboard → SQL Editor

-- 1) Tabela de Seguidores
create table if not exists public.seguidores (
  id uuid primary key default gen_random_uuid(),
  seguidor_id uuid not null references auth.users(id) on delete cascade,
  seguido_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  constraint check_nao_seguir_a_si_mesmo check (seguidor_id <> seguido_id),
  constraint unico_seguimento unique (seguidor_id, seguido_id)
);

-- 2) Índices para alta performance em consultas de grafo social
create index if not exists idx_seguidores_seguidor on public.seguidores(seguidor_id);
create index if not exists idx_seguidores_seguido on public.seguidores(seguido_id);

-- 3) Habilitar RLS
alter table public.seguidores enable row level security;

-- Políticas RLS
drop policy if exists "seguidores_select_public" on public.seguidores;
create policy "seguidores_select_public" on public.seguidores
  for select
  using (true);

drop policy if exists "seguidores_insert_own" on public.seguidores;
create policy "seguidores_insert_own" on public.seguidores
  for insert
  with check (auth.uid() = seguidor_id);

drop policy if exists "seguidores_delete_own" on public.seguidores;
create policy "seguidores_delete_own" on public.seguidores
  for delete
  using (auth.uid() = seguidor_id);

-- Permitir leitura de perfis por todos (necessário para listar quem são os seguidores/seguindo)
drop policy if exists "perfis_select_all" on public.perfis;
create policy "perfis_select_all" on public.perfis
  for select
  using (true);
