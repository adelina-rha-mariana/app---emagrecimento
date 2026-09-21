-- Tabela nova e isolada pro streak semanal (não mexe em nenhuma tabela
-- existente). Cada linha marca "usuário abriu o app nesse dia" — usada só
-- pra desenhar o calendário de 7 dias na tela do plano.
create table if not exists public.checkins_diarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dia date not null default current_date,
  created_at timestamptz not null default now(),

  unique (user_id, dia)
);

comment on table public.checkins_diarios is
  'Um checkin por usuário por dia (marcado ao abrir a tela do plano) — alimenta o streak semanal.';

alter table public.checkins_diarios enable row level security;

create policy "usuario le seus proprios checkins"
  on public.checkins_diarios
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "usuario cria seu proprio checkin"
  on public.checkins_diarios
  for insert
  to authenticated
  with check (auth.uid() = user_id);
