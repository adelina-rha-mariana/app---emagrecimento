-- Introduz contas de usuário (Supabase Auth) e persistência real de progresso.
-- Antes desta migration, respostas_questionario e avaliacoes_dia7 aceitavam
-- INSERT anônimo (papel "anon") porque não existia login. Agora que a conta é
-- criada logo após o pagamento aprovado (antes de /avaliacao), essas escritas
-- passam a exigir usuário autenticado e dono da própria linha.

-- ---------------------------------------------------------------------------
-- respostas_questionario: ganha dono
-- ---------------------------------------------------------------------------
alter table public.respostas_questionario
  add column if not exists user_id uuid references auth.users(id);

drop policy if exists "permitir insercao anonima" on public.respostas_questionario;

create policy "usuario insere sua propria resposta"
  on public.respostas_questionario
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "usuario le sua propria resposta"
  on public.respostas_questionario
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- planos: o plano de 5 dias gerado pela IA, por usuário.
-- gerado_em é a base do desbloqueio por tempo (1 dia novo a cada 24h).
-- ---------------------------------------------------------------------------
create table if not exists public.planos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  gerado_em timestamptz not null default now(),

  altura_cm integer,
  peso_atual_kg numeric,
  peso_meta_kg numeric,

  perfil text not null,
  acolhimento text not null,
  insight_cientifico text,
  dias jsonb not null
);

comment on table public.planos is
  'Plano de 5 dias gerado por IA para cada usuário. gerado_em controla o desbloqueio por tempo dos Dias 2-5.';

alter table public.planos enable row level security;

create policy "usuario le seu proprio plano"
  on public.planos
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "usuario cria seu proprio plano"
  on public.planos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- registros_vitais: histórico de glicose/pressão ("Meus números"), por usuário.
-- Substitui o estado numHistory que hoje só vive em memória no navegador.
-- ---------------------------------------------------------------------------
create table if not exists public.registros_vitais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),

  glicose numeric,
  sistolica numeric,
  diastolica numeric
);

comment on table public.registros_vitais is
  'Registro manual de glicose/pressão ("Meus números"). O app não mede nada sozinho, só organiza o que a pessoa digita.';

alter table public.registros_vitais enable row level security;

create policy "usuario le seus proprios registros"
  on public.registros_vitais
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "usuario insere seus proprios registros"
  on public.registros_vitais
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- avaliacoes_dia7: ganha dono
-- ---------------------------------------------------------------------------
alter table public.avaliacoes_dia7
  add column if not exists user_id uuid references auth.users(id);

drop policy if exists "permitir insercao anonima" on public.avaliacoes_dia7;

create policy "usuario insere sua propria avaliacao"
  on public.avaliacoes_dia7
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "usuario le sua propria avaliacao"
  on public.avaliacoes_dia7
  for select
  to authenticated
  using (auth.uid() = user_id);
