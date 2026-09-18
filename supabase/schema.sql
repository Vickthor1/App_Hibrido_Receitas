-- Supabase schema para App_Hibrido_Receitas
-- Cole este SQL no SQL Editor do Supabase Dashboard (https://supabase.com/dashboard/project/_/sql)

-- 1) Perfis (estende auth.users)
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 60),
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Adiciona coluna avatar_url se a tabela já existir
alter table public.perfis add column if not exists avatar_url text;

-- 2) Favoritos (protegido por RLS)
create table if not exists public.favoritos (
  user_id uuid not null references auth.users(id) on delete cascade,
  id_meal text not null check (id_meal ~ '^[0-9]{4,8}$'),
  str_meal text not null,
  str_thumb text not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, id_meal)
);

-- 2.5) Receitas criadas pelo usuário
create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 80),
  categoria text,
  tempo text,
  ingredientes text,
  modo text,
  created_at timestamp with time zone default now()
);

-- 2.6) Avaliações (uma por usuário por receita)
create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  id_meal text not null,
  nota integer not null check (nota between 1 and 5),
  comentario text,
  created_at timestamp with time zone default now(),
  unique (user_id, id_meal)
);

-- Índices
create index if not exists idx_favoritos_user on public.favoritos(user_id);
create index if not exists idx_receitas_user on public.receitas(user_id);
create index if not exists idx_avaliacoes_user on public.avaliacoes(user_id);

-- 3) RLS
alter table public.perfis enable row level security;
alter table public.favoritos enable row level security;
alter table public.receitas enable row level security;
alter table public.avaliacoes enable row level security;

drop policy if exists "perfis_select_own" on public.perfis;
create policy "perfis_select_own" on public.perfis for select using (auth.uid() = id);
drop policy if exists "perfis_insert_own" on public.perfis;
create policy "perfis_insert_own" on public.perfis for insert with check (auth.uid() = id);
drop policy if exists "perfis_update_own" on public.perfis;
create policy "perfis_update_own" on public.perfis for update using (auth.uid() = id);

drop policy if exists "favoritos_all_own" on public.favoritos;
create policy "favoritos_all_own" on public.favoritos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "receitas_all_own" on public.receitas;
create policy "receitas_all_own" on public.receitas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "avaliacoes_all_own" on public.avaliacoes;
create policy "avaliacoes_all_own" on public.avaliacoes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Trigger para criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome) values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- 5) Supabase Storage — Bucket de Avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Políticas de acesso ao bucket 'avatars'
drop policy if exists "Avatars sao publicos para leitura" on storage.objects;
create policy "Avatars sao publicos para leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Usuarios podem subir seus proprios avatars" on storage.objects;
create policy "Usuarios podem subir seus proprios avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios podem atualizar seus proprios avatars" on storage.objects;
create policy "Usuarios podem atualizar seus proprios avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios podem deletar seus proprios avatars" on storage.objects;
create policy "Usuarios podem deletar seus proprios avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) Verificação
-- select * from auth.users; -- ver usuários
-- select * from public.perfis;
-- select * from public.favoritos;
