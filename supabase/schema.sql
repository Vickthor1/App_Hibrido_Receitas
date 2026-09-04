-- Supabase schema para App_Hibrido_Receitas
-- Cole este SQL no SQL Editor do Supabase Dashboard (https://supabase.com/dashboard/project/_/sql)

-- 1) Perfis (estende auth.users)
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 60),
  created_at timestamp with time zone default now()
);

-- 2) Favoritos (protegido por RLS)
create table if not exists public.favoritos (
  user_id uuid not null references auth.users(id) on delete cascade,
  id_meal text not null check (id_meal ~ '^[0-9]{4,8}$'),
  str_meal text not null,
  str_thumb text not null,
  created_at timestamp with time zone default now(),
  primary key (user_id, id_meal)
);

-- Índices
create index if not exists idx_favoritos_user on public.favoritos(user_id);

-- 3) RLS
alter table public.perfis enable row level security;
alter table public.favoritos enable row level security;

drop policy if exists "perfis_select_own" on public.perfis;
create policy "perfis_select_own" on public.perfis for select using (auth.uid() = id);
drop policy if exists "perfis_insert_own" on public.perfis;
create policy "perfis_insert_own" on public.perfis for insert with check (auth.uid() = id);
drop policy if exists "perfis_update_own" on public.perfis;
create policy "perfis_update_own" on public.perfis for update using (auth.uid() = id);

drop policy if exists "favoritos_all_own" on public.favoritos;
create policy "favoritos_all_own" on public.favoritos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Trigger para criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome) values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- 5) Verificação
-- select * from auth.users; -- ver usuários
-- select * from public.perfis;
-- select * from public.favoritos;
